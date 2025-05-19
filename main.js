const TelegramBot = require("node-telegram-bot-api")
require("dotenv").config()
const TOKENBMKG = process.env.tokenBMKG
const APIKEYWEATHER = process.env.WEATHER_API_KEY

const options = {
    polling: true
}

const cuyBot = new TelegramBot(TOKENBMKG, options) //untuk produktion lbih baik gunakan webHook bukn polling

const prefix = "/"
const sayHi = new RegExp(`^${prefix}sayHi$`) //spesifik  
const gempa = new RegExp(`^${prefix}gempa$`)
const start = new RegExp(`^${prefix}start$`)
const cuaca = new RegExp(`^${prefix}cuaca_(.+)$`)

cuyBot.onText(start, (callback) => {
    cuyBot.sendMessage(callback.chat.id, `Halo saya L-Bot saya adalah bot yang menyediakan berbagai informasi terkini🙂.\nPerintah yang tersedia: \n${ prefix }gempa - Menampilkan info gempa terbaru\n${prefix}sayHi - Ucapan salam\n${prefix}cuaca_sukabumi <Ganti kota kamu> - Menampilkan cuaca kota`)
})

cuyBot.onText(sayHi, (callback) => {
    cuyBot.sendMessage(callback.from.id, "haloooo")
})

cuyBot.onText(cuaca, async(callback, match) => {
    const chatId = callback.chat.id
    const lokasi = match[1]
    
    try {
        const WEATHER_ENPOINT = `https://api.openweathermap.org/data/2.5/weather?q=${lokasi}&units=metric&lang=id&appid=${APIKEYWEATHER}`
        const response = await fetch(WEATHER_ENPOINT)
        const data = await response.json()
 
        const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`

        if(data.cod !== 200) {
            return cuyBot.sendMessage(chatId, `Lokasi ${lokasi} tidak ditemukan`)
        }

        const resultText = `
*Info cuaca di ${data.name}*

*Kota* : ${data.name}
*Negara* : ${data.sys.country}
*Kondisi* : ${data.weather[0].description}
*Suhu* : ${data.main.temp}°C
*Kelembapan* : ${data.main.humidity}%
*Kecepatan Angin* : ${data.wind.speed} m/s
        `
        cuyBot.sendPhoto(chatId, iconUrl, {
            caption: resultText,
            parse_mode: "Markdown"
        })
    } catch (error) {
        console.error("Gagal mengambil data cuaca", error)
        cuyBot.sendPhoto(callback.from.id, "Maaf data cuaca tidak dapat diakses saat ini")
    }
})

cuyBot.onText(gempa, async (callback) => {
    const BMKG_ENDPOINT = "https://data.bmkg.go.id/DataMKG/TEWS/"
    
    try {
        const apiCall = await fetch(BMKG_ENDPOINT + "autogempa.json")
        const response = await apiCall.json()
        const latest = response.Infogempa.gempa
    
        const BKMGImage = BMKG_ENDPOINT + latest.Shakemap
    
        const resultText = `
*INFORMASI GEMPA TERKINI*

*Waktu*     : _${latest.Jam}_
*Tanggal*   : _${latest.Tanggal}_
*Date Time* : _${latest.DateTime}_
*Magnitudo*: _${latest.Magnitude} SR_
*Kedalaman* : _${latest.Kedalaman}_
*Wilayah*   : _${latest.Wilayah}_
*Potensi*   : _${latest.Potensi}_
    `
        cuyBot.sendPhoto(callback.from.id, BKMGImage, {
            caption: resultText,
            parse_mode: "Markdown"
        })
    } catch (error) {
        console.error("Gagal mengambil data gempa", error)
        cuyBot.sendPhoto(callback.from.id, "Maaf data gempa tidak dapat diakses saat ini")
    }
})