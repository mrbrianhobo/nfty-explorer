import React from 'react';
import '../styles/SearchBar.css';
import 'nes.css/css/nes.css';

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      address: '', // initialize to empty string
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    const address = e.target.value;
    this.setState({ address });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { web3, onSearch } = this.props;
    const { address } = this.state;

    if (address !== '') { // form value is not empty
      if (web3.utils.isAddress(address)) {
        onSearch(address);
      } else {
        alert("this user doesn't exist!");
        this.setState({ address: '' }); // clear back to empty string
      }
    }
  }

  render() {
    const { isHome } = this.props;
    const { address } = this.state;
    return (
      <div className={isHome ? "nes-field search-container" : "nes-field search-container-top"}>
        {isHome ? <label htmlFor="address_field">nft explorer</label> : null}
        <div className="search-bar">
          <form onSubmit={this.handleSubmit}>
            <input
              type="text" 
              id="address_field" 
              className="nes-input search-input" 
              placeholder="your ethereum address 0x000...000"
              value={address}
              onChange={this.handleChange} 
            />
            <button type="submit" className="nes-btn is-primary search-button">
              <span>🔍</span>
            </button>
          </form>
        </div>
      </div>
    );
  }
};