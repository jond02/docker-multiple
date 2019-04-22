import React, { Component } from "react";
import axios from "axios";

class Fib extends Component {
    state = {
        seenIndices: [],
        values: {},
        index: ""
    };
    
    componentDidMount() {
        this.fetchValues();
        this.fetchIndices();
    }
    
    async fetchValues() {
        const values = await axios.get("/api/values/current");
        this.setState({ 
            values: values.data 
        });
    }
    
    async fetchIndices() {
        const seenIndices = await axios.get("/api/values/all");
        this.setState({
            seenIndices: seenIndices.data
        });
    }
    
    handleSubmit = async (event) => {
        event.preventDefault();
        
        await axios.post("/api/values", {
            index: this.state.index
        });
        this.setState({ index: "" });
    };
    
    renderseenIndices() {
        return this.state.seenIndices.map(({number}) => number).join(", ");
    }
    
    renderValues() {
        const enteries = [];
        
        for (let key in this.state.values) {
            enteries.push(
                <div key={key}>
                    For index {key} I calculated {this.state.values[key]}
                </div>
            );
        }
        return enteries;
    }
    
    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter your index:</label>
                    <input 
                        value={this.state.index}
                        onChange={event => this.setState({ index: event.target.value})}
                    />
                    <button>Submit</button>
                </form>
                
                <h3>Indices I have seen:</h3>
                {this.renderseenIndices()}
                
                <h3>Calculated Values:</h3>
                {this.renderValues()}
                
            </div>
        )
    }
}

export default Fib;