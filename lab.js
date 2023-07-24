let text = "Get the [col] Unicode of the [first] character";
let arr = [];
text.match(/(\[[a-zA-Z_]*\])/g).forEach((matched) => {
  arr.push(matched);
})

let values = [{ name: "[col]", text: "best" }];

for (let j = 0; j < values.length; j++) {
    const val = values[j];
    
  for (let i = 0; i < arr.length; i++) {
    if (val.name == arr[i]) {
      let rgx = new RegExp("(\\[" + val.name + "*\\])", 'g');

      console.log(text.replace(rgx, val.text));
    }
  }
}

fetch("https://cleancity.uz/ds?xenc=fE4fu0_fbQKjeAULCOK9GzLG_WjClktRjPuIvL2UzlzZjiQ6GsULXIyZOZ0Pu1AKh8K5rGXddmCXUXAprzmNz0ugH9I6Clch", {
  "headers": {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,uz;q=0.7",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest"
  },
  "referrer": "https://cleancity.uz/dashboard?x=nvXIxmiWvZlgli2wiSd7Hz1I8O0WWv8JnknafZvYgQrQXD5h7*ztHlc-w3OoR1vdUhS7X2SdBp4tDvhcji-bvQ",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "mahallas_id=60365&companies_id=1144",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});

fetch("https://cleancity.uz/ds?xenc=fE4fu0_fbQKjeAULCOK9G-fMtknSHgPsPFD9RfUFmdGMmTmdD7tQCofCuaxl3XZgl1FwKa85jc_x8dcTVfOYPw==", {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,uz;q=0.7",
    "cache-control": "max-age=0",
    "content-type": "application/x-www-form-urlencoded",
    "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "iframe",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1"
  },
  "referrer": "https://cleancity.uz/dashboard?x=nvXIxmiWvZlgli2wiSd7Hz1I8O0WWv8JnknafZvYgQrQXD5h7*ztHlc-w3OoR1vdUhS7X2SdBp4tDvhcji-bvQ",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "id=&fio=%D0%A5%D0%BE%D0%BB%D0%B8%D0%BA%D0%BE%D0%B2%D0%B0++%D0%A8%D0%B0%D1%85%D0%BD%D0%BE%D0%B7%D0%B0+%D0%A5%D0%B0%D0%BC%D0%B4%D0%B0%D0%BC%D0%BE%D0%B2%D0%BD%D0%B0&prescribed_cnt=3&mahallas_id=60365&licshet=105120900426&streets_id=134907&kadastr_number=105120900426&headquarters_id=&ind=&house=&flat=&house_type_id=1&inn=&contract_number=&contract_date=01.07.2023&energy_licshet=&energy_coato=&phone=&home_phone=&email=&description=BOT&passport_location=&passport_number=%D0%90%D0%922281986&brith_date=&passport_given_date=&passport_expire_date=&pinfl=42011863920121",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
});