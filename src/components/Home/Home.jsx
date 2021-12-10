import React, { useEffect, useState } from "react";
import axios from "axios";
import "chart.js/auto";
import style from "./Home.module.css";
import { Line } from "react-chartjs-2";
import foggy from "./foggy.png";
import cloudy from "./cloudy.png";
import rain from "./rain.png";
import sun from "./sun.png";
import cities from "../../in.json";
// import {
//   Chart as ChartJS,
//   LineElement,
//   PointElement,
//   LinearScale,
//   Title,
// } from "chart.js";

export default function Home() {
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);
  const [grData, setGrData] = useState([]);
  const [prs, setPrs] = useState(0);
  const [hmd, setHmd] = useState(0);
  const [wkData, setWkData] = useState([]);
  const [token, setToken] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [inputvalue, setInputValue] = useState("");

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // async function ipLookUp() {
  //   try {
  //     let latlong = [];
  //     let res = await axios.get("http://ip-api.com/json");
  //     latlong[0] = res.data.lat;
  //     latlong[1] = res.data.lon;
  //     setLat(res.data.lat);
  //     setLon(res.data.lon);
  //     console.log(res.data);
  //     console.log(res.data.lat, res.data.lon);
  //     return latlong;
  //   } catch (err) {
  //     console.log(err.message);
  //   }
  // }
  const key = "f0d2f1a774b8b3bcb957a4e4d566f2a6";
  async function getAddress(latitude, longitude) {
    try {
      let res = await axios.get(
        `https://apis.mapmyindia.com/advancedmaps/v1/${key}/rev_geocode?lat=${latitude}&lng=${longitude}`
      );
      console.log(res.data);
      setInputValue(
        `${res.data.results[0].city}, ${res.data.results[0].state}`
      );
    } catch (err) {
      console.log(err.message);
    }
  }
  const key2 = "5c246c646c7122abc2aca2af99534630";
  async function getHourlyTemp(lat, lon) {
    let res = await axios.get(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${key2}`
    );
    let data = res.data.hourly;
    data = data.map((el) => el.temp - 273).filter((el, i) => i < 24);
    setGrData(data);
    setHmd(res.data.current.humidity);
    setPrs(res.data.current.pressure);
    let weekData = res.data.daily;
    // weekData = weekData.map((el) => el.temp.day);
    setWkData(weekData);
    // console.log(weekData);
    // console.log(data);
  }

  // async function getToken() {
  //   let res = await axios.post(
  //     "https://outpost.mapmyindia.com/api/security/oauth/token",
  //     {
  //       grant_type: "client_credentials",
  //       client_id:
  //         {client_id},
  //       client_secret:
  //        {client_secret},
  //     }
  //   );
  //   let data = res.data.access_token;
  //   console.log(data);
  //   setToken(data);
  // }

  function handleLocationFInd(val) {
    if (val === "") return;
    val = val[0].toUpperCase() + val.substring(1);
    let ans = cities.filter((el) => el.city.includes(val));
    // let datas = ans.map((el) => {
    //   async function fun(v) {
    //     let res = await axios.get(
    //       `https://api.openweathermap.org/data/2.5/weather?q=${v.city}&units=metric&appid=e4c70ce6a6821649a416cb9521d5f4f8`
    //     );
    //     return res.data;
    //   }
    //   return fun(el).then((res) => res);
    // });
    console.log(ans);
    setSearchData(ans);
  }

  useEffect(() => {
    async function fun() {
      // getToken();
      // let arr = await ipLookUp();
      if ("geolocation" in navigator) {
        // check if geolocation is supported/enabled on current browser
        navigator.geolocation.getCurrentPosition(
          function success(position) {
            // for when getting location is a success
            console.log(
              "latitude",
              position.coords.latitude,
              "longitude",
              position.coords.longitude
            );
            setLat(position.coords.latitude);
            setLon(position.coords.longitude);
            getAddress(position.coords.latitude, position.coords.longitude);
          },
          function error(error_message) {
            // for when getting location results in an error
            console.error(
              "An error has occured while retrieving location",
              error_message
            );
            // ipLookUp();
          }
        );
      } else {
        // geolocation is not supported
        // get your location some other way
        console.log("geolocation is not enabled on this browser");
        // ipLookUp();
      }
      // getAddress(arr[0], arr[1]);
      getHourlyTemp(lat, lon);
    }
    fun();
  }, []);

  return (
    <div className={style.section}>
      <div>
        <div className={style.searchSection}>
          <i className={`ion-location ${style.locIcon}`} />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => {
              setInputValue(e.target.value);
              return handleLocationFInd(e.target.value);
            }}
            value={inputvalue}
            className={style.searchinputTag}
          />
          <i className={`ion-ios7-search-strong ${style.locIcon1}`} />
          <section className={style.searchLocationsSection}>
            {searchData.map((el, i) => (
              <div
                key={i}
                className={style.eachSearchItem}
                onClick={async () => {
                  setInputValue(`${el.city}, ${el.admin_name}`);
                  setSearchData([]);
                  return await getHourlyTemp(el.lat, el.lng);
                }}
              >
                <div>{`${el.city},${el.admin_name}`}</div>
                <div>
                  <img
                    className={style.eachSearchItemWheather}
                    src={cloudy}
                    alt="img"
                  />
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
      <section className={style.wkSection}>
        {wkData.map(
          (el, i) =>
            i < 7 && (
              <div className={style.wkSectionEach} key={i}>
                <div>
                  <div>{days[new Date(el.dt * 1000).getDay()]}</div>
                  <div>
                    <span>{(el.temp.max - 273).toFixed(0) + " °"}</span>
                    <span> </span>
                    <span>{(el.temp.min - 273).toFixed(0) + " °"}</span>
                  </div>
                  <div>
                    {el.weather[0].main === "Rain" ? (
                      <img src={rain} style={{ width: "35px" }} alt="img" />
                    ) : el.weather.main === "Clouds" ? (
                      <img src={cloudy} style={{ width: "35px" }} alt="img" />
                    ) : el.weather.main === "Clear" ? (
                      <img src={sun} style={{ width: "35px" }} alt="img" />
                    ) : el.weather.main === "Haze" ? (
                      <img src={foggy} style={{ width: "35px" }} alt="img" />
                    ) : (
                      <img src={cloudy} style={{ width: "35px" }} alt="img" />
                    )}
                  </div>
                  <div>{el.weather[0].main}</div>
                </div>
              </div>
            )
        )}
      </section>
      <div className={style.graph}>
        <div>
          <Line
            height={400}
            width={600}
            options={{ maintainAspectRatio: false }}
            data={{
              labels: [
                12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7,
                8, 9, 10, 11,
              ],
              datasets: [
                {
                  label: "Temprature",
                  borderWidth: 5,
                  fill: true,
                  backgroundColor: "rgba(67, 95, 122, 0.205)",
                  borderColor: "rgba(86, 77, 163, 0.842)",
                  data: grData,
                  pointHitRadius: 2,
                  tension: 0.2,
                },
              ],
            }}
          />
        </div>
        <div className={style.prHm}>
          <div>
            <h3 style={{ margin: "0px" }}>Pressure</h3>
            <div>{prs + " hpa"}</div>
          </div>
          <div>
            <h3 style={{ margin: "0px" }}>Humidity</h3>
            <div>{hmd + " %"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
