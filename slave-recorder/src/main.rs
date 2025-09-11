use anyhow::{Context, Result};
use humansize::{format_size, BINARY};
use serde::Deserialize;
use serde_with::{serde_as, DisplayFromStr};
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    process::Stdio,
    time::Duration,
};
use tokio::{fs, process::Command, signal, task, time};
use tracing::{error, info, warn};

#[serde_as]
#[derive(Debug, Deserialize, Clone)]
struct Config {
    storage: Storage,
    ffmpeg: Option<Ffmpeg>,
    streams: Vec<Stream>,
}

#[serde_as]
#[derive(Debug, Deserialize, Clone)]
struct Storage {
    root_dir: PathBuf,
    #[serde_as(as = "DisplayFromStr")]
    max_disk_bytes: u64,
    segment_time_sec: u64,
    #[serde_as(as = "Option<DisplayFromStr>")]
    segment_target_bytes: Option<u64>,
    #[serde_as(as = "Option<DisplayFromStr>")]
    keep_free_bytes: Option<u64>,
    output_format: Option<String>,
}

#[derive(Debug, Deserialize, Clone)]
struct Ffmpeg {
    path: Option<String>,
    rtsp_transport: Option<String>,
    extra_input_args: Option<Vec<String>>,
    extra_output_args: Option<Vec<String>>,
}

#[derive(Debug, Deserialize, Clone)]
struct Stream {
    name: String,
    url: String,
    headers: Option<HashMap<String, String>>,
    bearer_token: Option<String>,
    transcode: Option<Transcode>,
}

#[derive(Debug, Deserialize, Clone)]
struct Transcode {
    v_bitrate: String,
    a_bitrate: Option<String>,
    codec: Option<String>,
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .init();

    let cfg_path = std::env::args()
        .nth(1)
        .unwrap_or_else(|| "config.toml".into());
    let data = fs::read_to_string(&cfg_path)
        .await
        .with_context(|| format!("не удалось прочитать {}", cfg_path))?;
    let cfg: Config = toml::from_str(&data).context("ошибка парсинга config.toml")?;

    fs::create_dir_all(&cfg.storage.root_dir).await?;

    let mut tasks = Vec::new();
    for s in cfg.streams.clone() {
        let cfg_clone = cfg.clone();
        tasks.push(task::spawn(async move {
            if let Err(e) = run_stream(s, cfg_clone).await {
                error!(error = %e, "поток завершился с ошибкой");
            }
        }));
    }

    let cleaner_cfg = cfg.clone();
    tasks.push(task::spawn(async move {
        if let Err(e) = disk_janitor(cleaner_cfg).await {
            error!(error=%e, "ошибка фоновой уборки");
        }
    }));

    signal::ctrl_c().await.ok();
    info!("остановка по Ctrl+C");
    Ok(())
}

async fn run_stream(stream: Stream, cfg: Config) -> anyhow::Result<()> {
    let dir = cfg.storage.root_dir.join(&stream.name);
    tokio::fs::create_dir_all(&dir).await?;

    let log_dir = cfg.storage.log_dir.clone()
        .unwrap_or_else(|| cfg.storage.root_dir.join("logs"));
    tokio::fs::create_dir_all(&log_dir).await?;
    let log_file = log_dir.join(format!("{}.log", &stream.name));

    loop {
        let out_pattern = match cfg.storage.output_format.as_deref() {
            Some("mp4") => dir.join("%Y%m%d-%H%M%S.mp4"),
            _ => dir.join("%Y%m%d-%H%M%S.ts"),
        };

        let ffmpeg_path = cfg.ffmpeg
            .as_ref()
            .and_then(|f| f.path.clone())
            .unwrap_or_else(|| "ffmpeg".into());

        let mut cmd = Command::new(&ffmpeg_path);
        cmd.arg("-hide_banner").arg("-loglevel").arg("info");

        // RTSP transport и дополнительные аргументы
        if let Some(ff) = &cfg.ffmpeg {
            if let Some(t) = &ff.rtsp_transport {
                cmd.arg("-rtsp_transport").arg(t);
            }
            if let Some(extra) = &ff.extra_input_args {
                for a in extra {
                    cmd.arg(a);
                }
            }
        }

        if let Some(h) = build_headers(&stream) {
            cmd.arg("-headers").arg(h);
        }

        cmd.arg("-i").arg(&stream.url);

        // Транскодирование или копирование
        if let Some(t) = &stream.transcode {
            cmd.arg("-c:v").arg(t.codec.as_deref().unwrap_or("libx264"));
            cmd.arg("-b:v").arg(&t.v_bitrate);
            if let Some(ab) = &t.a_bitrate {
                cmd.arg("-b:a").arg(ab);
            } else {
                cmd.arg("-an");
            }
            cmd.arg("-preset").arg("veryfast");
        } else {
            cmd.arg("-c").arg("copy");
        }

        cmd.arg("-f")
            .arg("segment")
            .arg("-segment_time")
            .arg(cfg.storage.segment_time_sec.to_string())
            .arg("-reset_timestamps")
            .arg("1")
            .arg("-strftime")
            .arg("1");

        if let Some(fmt) = cfg.storage.output_format.as_deref() {
            cmd.arg("-segment_format").arg(fmt);
        }

        if let Some(ff) = &cfg.ffmpeg {
            if let Some(extra) = &ff.extra_output_args {
                for a in extra {
                    cmd.arg(a);
                }
            }
        }

        cmd.arg(out_pattern.clone());
        cmd.stderr(std::process::Stdio::piped());
        cmd.stdout(std::process::Stdio::null());

        info!(name=%stream.name, "запуск ffmpeg");

        match cmd.spawn() {
            Ok(mut child) => {
                if let Some(stderr) = child.stderr.take() {
                    let mut reader = BufReader::new(stderr).lines();
                    let log_file_clone = log_file.clone();

                    // Асинхронно читаем stderr ffmpeg
                    tokio::spawn(async move {
                        while let Ok(Some(line)) = reader.next_line().await {
                            eprintln!("[{}] {}", stream.name, line);
                            if let Ok(mut f) = OpenOptions::new()
                                .create(true)
                                .append(true)
                                .open(&log_file_clone)
                                .await
                            {
                                let _ = f.write_all(line.as_bytes()).await;
                                let _ = f.write_all(b"\n").await;
                            }
                        }
                    });
                }

                let status = child.wait().await?;
                warn!(name=%stream.name, code=?status.code(), "ffmpeg завершился, перезапуск через 3с");
                tokio::time::sleep(Duration::from_secs(3)).await;
            }
            Err(e) => {
                error!(name=%stream.name, error=%e, "не удалось запустить ffmpeg, ретрай через 10с");
                tokio::time::sleep(Duration::from_secs(10)).await;
            }
        }
    }
}


fn build_headers(stream: &Stream) -> Option<String> {
    let mut pairs: Vec<(String, String)> = Vec::new();
    if let Some(token) = &stream.bearer_token {
        pairs.push(("Authorization".into(), format!("Bearer {}", token)));
    }
    if let Some(map) = &stream.headers {
        for (k, v) in map {
            pairs.push((k.clone(), v.clone()));
        }
    }
    if pairs.is_empty() {
        return None;
    }
    let s = pairs
        .into_iter()
        .map(|(k, v)| format!("{}: {}\r\n", k, v))
        .collect::<String>();
    Some(s)
}

async fn disk_janitor(cfg: Config) -> Result<()> {
    let mut interval = time::interval(Duration::from_secs(10));
    loop {
        interval.tick().await;
        if let Err(e) = enforce_quota(&cfg).await {
            warn!(error=%e, "ошибка контроля квоты");
        }
    }
}

async fn enforce_quota(cfg: &Config) -> Result<()> {
    let root = &cfg.storage.root_dir;
    let mut files: Vec<(PathBuf, u64, std::time::SystemTime)> = Vec::new();

    for entry in std::fs::read_dir(root)? {
        let e = entry?;
        if e.file_type()?.is_dir() {
            collect_files_sync(&e.path(), &mut files)?;
        }
    }

    let total: u64 = files.iter().map(|f| f.1).sum();

    if total <= cfg.storage.max_disk_bytes {
        return Ok(());
    }

    files.sort_by_key(|f| f.2);
    let mut to_delete_bytes = total - cfg.storage.max_disk_bytes;
    for (p, sz, _) in files {
        if to_delete_bytes == 0 {
            break;
        }
        match std::fs::remove_file(&p) {
            Ok(_) => {
                info!(
                    file=%p.to_string_lossy(),
                    size=%format_size(sz, BINARY),
                    "удалён для соблюдения квоты"
                );
                to_delete_bytes = to_delete_bytes.saturating_sub(sz);
            }
            Err(e) => warn!(file=%p.to_string_lossy(), error=%e, "не удалось удалить"),
        }
    }

    Ok(())
}

fn collect_files_sync(dir: &Path, out: &mut Vec<(PathBuf, u64, std::time::SystemTime)>) -> Result<()> {
    for entry in std::fs::read_dir(dir)? {
        let e = entry?;
        let p = e.path();
        if e.file_type()?.is_file() {
            let meta = e.metadata()?;
            let sz = meta.len();
            let mt = meta.modified().unwrap_or(std::time::SystemTime::UNIX_EPOCH);
            if p.extension()
                .and_then(|s| s.to_str())
                .map(|s| s == "ts" || s == "mp4")
                .unwrap_or(false)
            {
                out.push((p, sz, mt));
            }
        } else if e.file_type()?.is_dir() {
            collect_files_sync(&p, out)?;
        }
    }
    Ok(())
}

