// es5, 6, and 7 polyfills, powered by babel
require("babel-polyfill")

// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
require("isomorphic-fetch")

// universal utils: cache, fetch, store, resource, fetcher, router
// import {cache, fetch, store, resource, router} from 'universal-utils'

// the following line, if uncommented, will enable browserify to push
// a changed file to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
if (module.hot) {
    module.hot.accept()
}

// import {React, Component, DOM, Resolver, resolve} from 'react-resolver'
import DOM from 'react-dom'
import React, {Component} from 'react'

let Backbone = require('backbone'),
    $ = require('jquery')

window.jquery = $

function geoLoc(latLong){
    console.log('running geoLoc')
    var locUrl = "https://maps.googleapis.com/maps/api/geocode/json?latlng="

    return $.ajax({url: locUrl + latLong})
}

function geoAjax(query){
    var geoUrl = "https://maps.googleapis.com/maps/api/geocode/json?address="

    return $.ajax({url: geoUrl + query})
}

var WeatherView = React.createClass({

    getInitialState: function() {
        return {
            extra:'weekly',
            focusId:null
        }
    },

    _doHourly: function() {
        this.setState({
            extra:'hourly'
        })
    },

    _doWeekly: function() {
        this.setState({
            extra:'weekly'
        })
    },

    _walkieTalkie: function(id) {
        if (this.state.focusId===id)  {
            this.setState({
                focusId:null
            })
            return
        }
        this.setState({
            focusId:id
        })
    },

    render: function() {

        return (
            <div>
                <SearchContainer />
                <CurrentView data={this.props.data.currently} />
                <div id="multiView">
                    <input type='submit' value='Weekly Weather' onClick={this._doWeekly} />
                    <input type='submit' value='Hourly Weather' onClick={this._doHourly} />
                </div>
                <div id='extraView'>
                    <ExtraView walkieTalkie={this._walkieTalkie} extra={this.state.extra} data={this.props.data} focusId={this.state.focusId}/>
                </div>
            </div>
            )
    }
})

var SearchContainer = React.createClass({

    _getLoc: function() {
        navigator.geolocation.getCurrentPosition(function(data){
            var lat = data.coords.latitude,
                lng = data.coords.longitude

            location.hash = `search/${lat},${lng}`
        })
    },

    _handleEnter: (event) => {

        if (event.which === 13) {
            var inputEl = event.target,
                query = inputEl.value

            location.hash = `search/${query}`
            event.target.value = ''
        }
    },

    _handleInput: function() {
        var loc = this.refs.loc.value

        if (loc === '') {
            alert('Enter Search Term')
            return
        }

        location.hash = `search/${loc}`

    },

    render: function() {

        return (
            <div id='searchArea'>
                <a href='http://forecast.io' target='_' id="logo">Powered by Forecast</a>
                <div id="search">
                    <input type='text' placeholder='Search for Weather' ref='loc' id="searchBar" onKeyPress={this._handleEnter} />
                    <input type='submit' value='Submit' id="searchSubmit" onClick={this._handleInput}/>
                </div>
                <div id='currentLoc'>
                    <p>Current Location
                    <i className="material-icons" id='here' onClick={this._getLoc}>location_searching</i>
                    </p>
                </div>
            </div>
            )
    }
})

var CurrentView = React.createClass({

    render: function() {

        var weatherObj = this.props.data,
            currentTemp = weatherObj.apparentTemperature,
            humidity = weatherObj.humidity,
            rain = weatherObj.precipProbability,
            summary = weatherObj.summary

        currentTemp = currentTemp.toString().slice(0, 2)
        humidity = (humidity * 100).toString().slice(0,2)
        rain = (rain * 100).toString().slice(0,2)

        return (
            <div id='currentWeather'>
                <p>Weather Right Now</p>
                <p>{summary}</p>
                <p>Temp: {currentTemp}°F</p>
                <p>Humidity: {humidity}%</p>
                <p>Rain Chance: {rain}%</p>
            </div>
                )
    }
})

var ExtraView = React.createClass({

    _getDaily: function(day) {
        //console.log(day)
        var rain = (day.precipProbability * 100).toString().slice(0,2),
            humidity = (day.humidity * 100).toString().slice(0,2),
            summary = day.summary,
            d = new Date(day.time * 1000),
            dayArr = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            weekDay,
            r = new Date()

        weekDay = dayArr[d.getDay()]
        if (d.getDate()===r.getDate()) weekDay = 'Today'

        function doClick() {
            this.props.walkieTalkie(day.time)
        }

        var styleObj = {display:'none'},
            plusMinus = '+',
            borderObj = {backgroundColor:'transparent'},
            weather = 'wi wi-alien'

        if (this.props.focusId===day.time) {
            styleObj = {
                display:'flex'
            }
            plusMinus = '-'
            borderObj = {backgroundColor:'lightsteelblue'}
        }

        if (summary.indexOf('clear')!== -1 || summary.indexOf('Clear')!== -1) {
            weather = 'wi wi-day-sunny'
        }

        if (summary.indexOf('cloudy')!== -1) {
            weather = 'wi wi-cloudy'
        }

        if (summary.indexOf('rain')!== -1) {
            weather = 'wi wi-rain'
        }

        if (summary.indexOf('thunder')!== -1) {
            weather = 'wi wi-thunderstorm'
        }

        return (
            <div key={day.time} className="weekDays" style={borderObj}>
                <div>
                    <p className="sectionTitle">{weekDay}</p>
                    <input className="sectionButton" type='button' value={plusMinus} onClick={doClick.bind(this)} />
                </div>
                <div style={styleObj}>
                    <div className="details">
                        <p>{summary}</p>
                        <p>Temp: {day.apparentTemperatureMax}°F/{day.apparentTemperatureMin}°F</p>
                        <p>Humidity: {humidity}%</p>
                        <p>Rain Chance: {rain}%</p>
                    </div>
                    <div className='icon'>
                        <i className={weather}></i>
                    </div>
                </div>
            </div>
            )
    },

    _getHourly: function(hour) {
        //console.log(hour)
        var rain = (hour.precipProbability * 100).toString().slice(0,2),
            humidity = (hour.humidity * 100).toString().slice(0,2),
            summary = hour.summary,
            time = new Date(hour.time*1000).getHours(),
            temp = hour.apparentTemperature

        if (time-12>0) {
            time -= 12
            time = `${time}:00 P.M.`
        }
        else {
            time = `${time}:00 A.M.`
        }
        if (time==='12:00 A.M.') time = '12:00 P.M.'
        if (time==='0:00 A.M.') time = '12:00 A.M.'

        function doClick() {
            this.props.walkieTalkie(hour.time)
        }

        var styleObj = {display:'none'},
            plusMinus = '+',
            borderObj = {backgroundColor:'transparent'},
            weather = 'wi wi-alien'

        if (this.props.focusId===hour.time) {
            styleObj = {
                display:'flex'
            }
            plusMinus = '-'
            borderObj = {backgroundColor:'lightsteelblue'}
        }

        if (summary.indexOf('clear')!== -1 || summary.indexOf('Clear')!== -1) {
            weather = 'wi wi-day-sunny'
        }

        if (summary.indexOf('cloudy')!== -1) {
            weather = 'wi wi-cloudy'
        }

        if (summary.indexOf('rain')!== -1) {
            weather = 'wi wi-rain'
        }

        if (summary.indexOf('thunder')!== -1) {
            weather = 'wi wi-thunderstorm'
        }

        return (
            <div key={hour.time} className="hours" style={borderObj}>
                <div >
                    <p className="sectionTitle">{time}</p>
                    <input className="sectionButton" type='button' value={plusMinus} onClick={doClick.bind(this)} />
                </div>
                <div style={styleObj}>
                    <div className="details">
                        <p>{summary}</p>
                        <p>Temp: {temp}</p>
                        <p>Humidity: {humidity}%</p>
                        <p>Rain Chance: {rain}%</p>
                    </div>
                    <div className="icon">
                        <i className={weather} />
                    </div>
                </div>
            </div>
            )
    },

    render: function() {

        var daily = this.props.data.daily,
            hourly = this.props.data.hourly

        if (this.props.extra==='weekly') {

            return (
                <div id='dailyWeather'>
                    <h2>Weather for the Week</h2>
                    <p>{daily.summary}</p>
                    {daily.data.map(this._getDaily)}
                </div>
                )
        }

        if (this.props.extra==='hourly') {
            var hourlyArr = hourly.data.slice(0,24)

            return (
                <div id='hourlyWeather'>
                    <h2>Weather by the Hour</h2>
                    <p>{hourly.summary}</p>
                    {hourlyArr.map(this._getHourly)}
                </div>
                )
        }
    }
})

var lat = '29.767',
    lng = '-95.395'

var WeatherModel = Backbone.Model.extend({

    url:'https://api.forecast.io/forecast/b79c4066ee5c0ab13cf70ab690dff82f/',
    parse: function(responseData) {
        return responseData
    }
})

var WeatherRouter = Backbone.Router.extend({

    routes: {
        'search/:query':'showSearchView',
        '*anyroute':'showDefaultView'
    },

    showDefaultView: function() {
        var that = this
        this.wm.fetch({
            url:`${this.wm.url}${lat},${lng}`,
            dataType:'jsonp'
        }).done(function(data){
            DOM.render(<WeatherView data={data} />, document.querySelector('.container'))
        })
    },

    showSearchView: function(query) {
        console.log('searching')
        var that = this
        geoAjax(query).done(function(data){
            var loc = data.results[0].geometry.location,
                lat = loc.lat,
                lng = loc.lng
            that.wm.fetch({
                url:`${that.wm.url}${lat},${lng}`,
                dataType:'jsonp'
            }).done(function(data){
                DOM.render(<WeatherView data={data} />, document.querySelector('.container'))
            })
        })
    },

    initialize: function() {
        console.log('initializing router')
        this.wm = new WeatherModel()
        Backbone.history.start()
    }
})

var rtr = new WeatherRouter()














