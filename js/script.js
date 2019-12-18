// На загрузке вывести прогноз погоды в Москве
window.onload = () => {
    loadForecast(`Moscow`, `ru`);
}

// Ключ API c02cb322b51bba5f4b775b37851e4508
// Добавить ноль если дата или время меньше 10
const addZero = n => n < 10 ? `0${n}` : n;

// Очистить от элементов
const clear = (elem) => {
        while (elem.children[0]) elem.children[0].remove();
    }
    // Массив с названиями дней
const writeDayName = (n) => {
    const daysNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let day = ``;
    daysNames.forEach((elem, i) => day = i == n ? elem : day);
    return day;
}

// Модальное окно
const modal = document.querySelector('.modal');
const closeButton = modal.querySelector('#close-modal').onclick = () => closeOrOpenModal();

// Закрыть модальное окно 
const closeOrOpenModal = () => modal.classList.toggle('hide');

// Текущая погода
class Forecast {
    constructor(opt) {
        this.tempH1 = document.querySelector('.temp-and-weather h1');
        this.tempSpan = document.querySelector('.temp-and-weather span');
        this.cityA = document.querySelector('.temp a');
        this.dateP = document.querySelector('.temp .time');
        this.descList = document.querySelector('.weather-description table ');
        this.temp = opt.temp;
        this.city = opt.city;
        this.pres = opt.pres;
        this.hum = opt.hum;
        this.wind = opt.wind;
        this.desc = opt.desc;
    }

    setDate() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'
        ];
        let day = writeDayName(new Date().getDay());
        let month = ``;

        months.forEach((elem, i) => month = i == new Date().getMonth() ? elem : month);
        // Собрать всё в строку
        return `${addZero(new Date().getHours())}: ${addZero(new Date().getMinutes())} 
            ${day} ${new Date().getDate()} ${month} ${new Date().getFullYear()}`;
    }

    showCurrentForecast() {
        this.tempH1.innerHTML = this.temp > 0 ? `+${this.temp}&deg;` : `${this.temp}&deg;`;
        this.tempSpan.textContent = this.desc[0].toUpperCase() + this.desc.slice(1);
        this.dateP.textContent = this.setDate();
        this.cityA.textContent = this.city;
        this.descList.innerHTML = `
        <tr>
        <th>Pressure</th>
        <td>${this.pres} mm</td>
        </tr>
        <tr>
        <th>Humidity</th>
        <td>${this.hum}%</td>
        </tr>
        <tr>
        <th>Wind speed</th>
        <td>${this.wind}m/s</td>
        </tr>
        <tr>
        <td></td>
        </tr>
        `;
        this.cityA.onclick = () => closeOrOpenModal();
    }
}

// Погода на 5 дней
const fiveDaysUl = document.querySelector('.weekly-forecast ul');

class FiveDayForecast {
    constructor(opt) {
        this.temp = opt.temp;
        this.pres = opt.pres;
        this.hum = opt.hum;
        this.wind = opt.wind;
        this.date = opt.date;
        this.day = opt.day;
    }

    showFiveDaysForecast() {
        fiveDaysUl.innerHTML += `
            <li>
            <div class="dates"><span class="day">${writeDayName(this.day)}</span>
            <span class="date">${this.date.slice(8,10)}.${this.date.slice(5,7)}</span>
            </div>
            <h2>${this.temp}&deg;</h2>

            <div class="weather-table">
                <table>
                    <tr>
                        <th>Pressure</th>
                        <td>${this.pres} MM</td>
                    </tr>

                    <tr>
                        <th>Humidity</th>
                        <td>${this.hum}%</td>
                    </tr>

                    <tr>
                        <th>Wind speed</th>
                        <td>${this.wind}M/S</td>
                    </tr>
            </table>
            </div>
        </li>
            `;
    }
}

// Выбор городов

//Если нажать на Escape или нажать мимо меню с выбором городов

const closeModal = e => { if (e.target === modal || e.code == 'Escape') closeOrOpenModal(); };
window.onclick = closeModal;
window.onkeydown = closeModal;
// Списки стран и городов
const countries = document.querySelectorAll('.countries ul li');
const cities = document.querySelector('.cities ul');

// При выборе убрать выделение со всех строк
const clearClass = (collection, htmlClass) => {
    collection.forEach(elem => elem.classList.remove(htmlClass));
}

countries.forEach(elem => {
    elem.onclick = () => {
        clearClass(countries, 'cou-active');
        elem.classList.add('cou-active');
        loadCities(elem.getAttribute('data-country'));
    }
})

const search = document.querySelector('#search');

// Загружаем список городов
function loadCities(country) {
    fetch('../js/current.city.list.min.json')
        .then(response => {
            if (response.status === 200 && response.statusText === 'OK') {
                response.json().then(data => {
                    while (cities.children[0]) cities.children[0].remove();

                    search.placeholder = `Search in ${country}`;

                    const a = data.sort((a, b) => a.name > b.name ? 1 : -1).filter(elem => {
                        if (elem.country == country) {
                            createCitiesList(elem);
                            search.disabled = false;
                            return elem;
                        }
                    });

                    search.oninput = function() {
                        while (cities.children[0]) cities.children[0].remove();
                        a.forEach(elem => {
                            if (elem.name.toLowerCase().slice(0, this.value.length).match(this.value.toLowerCase())) {
                                createCitiesList(elem);
                                chooseCity();
                            }
                        });
                    }
                    chooseCity();
                });
            } else console.log('Не соединился');
        })

    // По нажатию на страну, или после поиска в строке вывести список городов
    function createCitiesList(elem) {
        const li = document.createElement('li');
        li.textContent = elem.name;
        li.setAttribute('data-city', elem.name);
        cities.appendChild(li);
    }
    // По клику выбрать город и закрыть модальное окно

    function chooseCity() {
        for (let i = 0; i < cities.children.length; i++) {
            cities.children[i].onclick = function() {
                loadForecast(this.getAttribute('data-city'), country);
            }
        }
    }
}

// Загружаем погоду на текущий день
function loadForecast(city, country) {
    load(`http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=c02cb322b51bba5f4b775b37851e4508`,
        false);
    load(`http://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&appid=c02cb322b51bba5f4b775b37851e4508`,
        true);

    function load(url, fiveDays) {
        const callback = fiveDays ? loadFiveDays : loadCurrentDay;
        fetch(url)
            .then(response => {
                if (response.status == 200 && response.statusText == 'OK') response.json().then(data => {
                    callback(data);
                    modal.classList.add('hide');
                });
                else console.log('Не соединился');
            })
            .catch(err => console.log(err));
    }
}

// Загружаем погоду на 5 следующих дней
function loadCurrentDay(data) {
    new Forecast({
        temp: Math.round(data.main.temp - 273.15),
        city: data.name,
        pres: data.main.pressure,
        hum: data.main.humidity,
        wind: data.wind.speed,
        desc: data.weather[0].description
    }).showCurrentForecast();
}

function loadFiveDays(data) {
    clear(fiveDaysUl);
    // Нужен прогноз на 5 дней
    for (let i = 1; i < 6; i++) nextDate(i);

    // Получаю текущую дату и прибавляю индекс из цикла к дню
    function nextDate(n) {
        let y = new Date().getFullYear();
        let m = new Date().getMonth();
        let d = new Date().getDate();

        let nextY = new Date(y, m, d + n).getFullYear();
        let nextM = new Date(y, m, d + n).getMonth() + 1;
        let nextD = new Date(y, m, d + n).getDate();

        addDays(`${nextY}-${addZero(nextM)}-${addZero(nextD)}`,
            new Date(y, m, d + n).getDay());
    }

    // Сравниваю даты из массива с датой полученной из функции выше
    // В переменные кладу среднее арифметическое из свойств объектов

    function addDays(date, dayNum) {
        let t = 0,
            p = 0,
            h = 0,
            w = 0,
            i = 0;
        data.list.forEach(elem => {
            if (elem.dt_txt.slice(0, 10) == date) {
                i++;
                t += elem.main.temp;
                p += elem.main.pressure;
                h += elem.main.humidity;
                w += elem.wind.speed;
            }
        })
        new FiveDayForecast({
            temp: Math.round(t / i - 273.15),
            pres: Math.round(p / i),
            hum: Math.round(h / i),
            wind: Math.round(w / i),
            date: date,
            day: dayNum
        }).showFiveDaysForecast();
    }
}