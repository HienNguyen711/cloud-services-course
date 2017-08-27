import React, { Component } from 'react';

class Error extends Component {
    render() {
        return (
            <div className="panel-body">
                <h4 className="alert alert-danger">404. There is an error with your request . Please go back </h4>
            </div>
        );
    }
}

export default Error;
/**
 * handle error page 
 */