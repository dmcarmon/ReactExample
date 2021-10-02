import React, { Component } from "react";
import EditableSection from "./EditableSection";
import WeatherCard from "./WeatherCard";
import "./styles/App.css";

class App extends Component {
  constructor(props) {
    super(props);

    // State setup
    this.state = {
      startDate: null, // could initialize the dates to new Date() to have it showing the current time
      endDate: null, // could initialize to new Date()
      location: "",
      data: [],
      errorMessage: ""
    };

    // Retrieving the data from the JSON file.
    fetch('test-data.json',
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'        
        }
      }
    ).then(function(response) {
      return response.json();
    }).then(function(json) {
      // Filtering out any incorrectly formatted dates.
      let filteredData = json.filter((d) => {
        return !isNaN(new Date(d.date).getDate());
      });
      // Note: I'm assuming here that the data is pre-sorted by date.
      this.setState({
        data: filteredData,
        startDate: new Date(filteredData[0].date),
        endDate: new Date(filteredData[filteredData.length - 1].date)
      });
    }.bind(this)).catch(function(e) {
      // Handle malformed json.
      this.setState({
        errorMessage: e?.toString()
      })
    }.bind(this))
  }
  render() {

    // Helper function to determine which weather cards match the current filters.
    const shouldShowItem=(item) => {
      // Note: I'm making the location comparison loose to allow partial matches.
      return (!this.state.startDate || new Date(item.date).getTime() >= this.state.startDate.getTime())
        && (!this.state.endDate || new Date(item.date).getTime() <= this.state.endDate.getTime())
        && (!this.state.location || item.town.toLowerCase().indexOf(this.state.location.toLowerCase()) >= 0);
    };

    let text = "";
    let itemsToShow = [];
    if (this.state.errorMessage) {
      // Display an error, if cannot parse json.
      text = 'An error occurred retrieving the weather data: "' + this.state.errorMessage + '"';
    } else {
      itemsToShow = this.state.data.filter(shouldShowItem);
      // I decided it would be handy to have a count of how many weather cards were showing.
      const numberOfCards = this.state.data.length;
      const numberOfCardsShowing = itemsToShow.length;
      text = "Displaying " + numberOfCardsShowing + " of " + numberOfCards;    
    }

    return (
      <div className="App">
        <EditableSection
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          location={this.state.location}
          onStartDateChange={(value) => {
            this.setState({
              startDate: new Date(value)
            });
          }}
          onEndDateChange={(value) => {
            this.setState({
              endDate: new Date(value)    
            });
          }}
          onLocationChange={(event) => {
            this.setState({
              location: event.currentTarget.value
            });
          }}
        />
        <div>{text}</div>
        <div className="editable-section">
          {itemsToShow.map((item) => (
            <WeatherCard
              date={item.date}
              weather={item.weather}
              location={item.town}
              key={item.date+item.town}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default App;
