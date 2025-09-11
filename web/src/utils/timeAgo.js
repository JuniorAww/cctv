import { useState, useEffect } from "react";

export default function TimeAgo({ unixTime }) {
  const [text, setText] = useState("Неизвестно");

  useEffect(() => {
    if(!+unixTime) return;
    // Если передали секунды – переводим в миллисекунды
    if (unixTime < 1e12) unixTime *= 1000;

    const declOfNum = (n, forms) => {
      n = Math.abs(n) % 100;
      const n1 = n % 10;
      if (n > 10 && n < 20) return forms[2];
      if (n1 > 1 && n1 < 5) return forms[1];
      if (n1 === 1) return forms[0];
      return forms[2];
    };

    const update = () => {
      const now = Date.now();
      let diff = Math.floor((now - unixTime) / 1000);
      if (diff < 0) diff = 0;

      let result;
      if (diff < 5) result = "Только что";
      else if (diff < 60) result = `${diff} ${declOfNum(diff, ["секунду", "секунды", "секунд"])} назад`;
      else {
        const minutes = Math.floor(diff / 60);
        if (minutes < 60) result = `${minutes} ${declOfNum(minutes, ["минуту", "минуты", "минут"])} назад`;
        else {
          const hours = Math.floor(diff / 3600);
          if (hours < 24) result = `${hours} ${declOfNum(hours, ["час", "часа", "часов"])} назад`;
          else {
            const days = Math.floor(diff / 86400);
            if (days < 30) result = `${days} ${declOfNum(days, ["день", "дня", "дней"])} назад`;
            else {
              const months = Math.floor(days / 30);
              if (months < 12) result = `${months} ${declOfNum(months, ["месяц", "месяца", "месяцев"])} назад`;
              else {
                const years = Math.floor(days / 365);
                result = `${years} ${declOfNum(years, ["год", "года", "лет"])} назад`;
              }
            }
          }
        }
      }

      setText(result);
    };

    update(); // сразу обновляем
    const interval = setInterval(update, 1000); // каждая секунда

    return () => clearInterval(interval); // чистим интервал при размонтировании
  }, [unixTime]);

  return text;
}
