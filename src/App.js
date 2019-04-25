import React, { Component } from 'react';
// import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Anime from 'react-anime';
import Web3 from 'web3';
import './styles/App.css';
import SearchBar from './components/SearchBar.jsx';
import Card from './components/Card.jsx';
import Pagination from './components/Pagination.jsx';
import Loading from './components/Loading.jsx';

// https://api.opensea.io/api/v1/assets/?owner=0x0239769a1adf4def9f07da824b80b9c4fcb59593&order_by=sale_date&order_direction=asc&limit=8&offset=0

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: null,
    	isHome: true,
    	isLoading: false,
    	address: '',
      page: 0,
      prevPage: null,
      currPage: [],
      nextPage: null,
    };

    this.handleSearch = this.handleSearch.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
  }

  componentWillMount() {
    const web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider("https://mainnet.infura.io/"));
    this.setState({ web3: web3 });
  }

  componentWillUnmount() {
    this.setState({ web3: null });
  }

  async getAssets(address, page, limit) {
  	let offset = (page - 1) * 8;
  	let url = "https://api.opensea.io/api/v1/assets/?owner=" + address + "&limit=" + limit + "&offset=" + offset;
    let options = {
      method: "GET",
      withCredentials: true,
      credentials: "include",
      headers: {
        "X-API-KEY": "b033c7a00b9d4a66964de9d699248e09"
      }
    };
    try {
      let response = await fetch(url, options);
      if (!response.ok) {
        throw new Error('Something went wrong');
      }
      let json = await response.json();
      let nfts = this.parseJsonObject(json);
      console.log(json);
      console.log(nfts);
      return nfts;
    } catch (error) {
      console.log(error)
      return [];
    }
  }

  parseJsonObject(json) {
    let assetList = json.assets;
    let nfts = [];
    for (let asset of assetList) {
      let nft = {
        id: asset.token_id,
        name: asset.name,
        description: asset.description,
        imageUrl: asset.image_url,
        backgroundColorCode: asset.background_color,
        permalink: asset.permalink,
        assetContract: asset.asset_contract.name
      };
      nfts.push(nft);
    }
    return nfts;
  }

  // non-empty & valid address
  async handleSearch(address) {
    this.setState({ isLoading: true });
    let nfts = await this.getAssets(address, 1, 16);
    let next = null;
    if (nfts.length === 0) {
      nfts = [];
    } 
    if (nfts.length <= 8) {
      // do nothing
    }
    if (nfts.length > 8) {
      next = nfts.splice(8);
    }
    this.setState({ 
      isLoading: false,
      isHome: false,
      address: address, 
      page: 1, 
      prevPage: null, 
      currPage: nfts, 
      nextPage: next
    });
  }

  async handleNext() {
    this.setState({ isLoading: true });
    const { address, page } = this.state;
    let next = await this.getAssets(address, page + 2, 8);
    if (next.length === 0) {
      next = null;
    }
    this.setState(prevState => ({
      isLoading: false,
      isHome: false,
      address: prevState.address, 
      page: prevState.page + 1, 
      prevPage: prevState.currPage, 
      currPage: prevState.nextPage, 
      nextPage: next
    }));
  }

  async handlePrev() {
    this.setState({ isLoading: true });
    const { address, page } = this.state;
    let prev = null;
    if (page > 2) {
      prev = await this.getAssets(address, page - 2, 8);
    }
    this.setState(prevState => ({
      isLoading: false,
      isHome: false,
      address: prevState.address, 
      page: prevState.page - 1, 
      prevPage: prev, 
      currPage: prevState.prevPage, 
      nextPage: prevState.currPage
    }));
  }

  renderCards() {
    const { currPage, address, page } = this.state;
    let key = address + "?page=" + page;
    let assets = currPage.map(asset => <Card key={asset.assetContract + " #" + asset.id} asset={asset} />);
    let animeProps = {
      opacity: [0,1],
      translateY: ["1rem", 0],
      delay: (el, i) => i * 100,
      easing: "easeOutQuart",
    };

    return (
      <Anime {...animeProps} key={key}>
        {assets.map((card, i) => <div key={i}>{card}</div>)}
      </Anime>
    );
  }

  renderLoading() {
    const { isLoading } = this.state;
    return (
      <div>
        {isLoading ? (
          <Loading />
        ) : (
          null
        )}
      </div>
    );
  }

  renderPagination() {
    const { nextPage, isLoading } = this.state;
    let hasNextPage = nextPage !== null;
    return (
      <div>
        {isLoading ? (
          null
        ) : (
          <Pagination 
            pageNum={this.state.page} 
            hasNextPage={hasNextPage} 
            onNextPage={this.handleNext} 
            onPrevPage={this.handlePrev} 
          />
        )}
      </div>
    );
  }

  render() {
    const { isHome, web3 } = this.state;
    return (
      <div className="flex-wrapper">
        <div className="container">
          <header>
            <h1 className="heading">nfty.fun</h1>
          </header>
          <SearchBar isHome={isHome} web3={web3} onSearch={this.handleSearch}/>
          {this.renderLoading()} 
          {isHome ? (
          	  null
          	) : (
          	  <div>
                <div className="card-container">
                  {this.renderCards()}
                </div>
              	{this.renderPagination()}
              </div>
          	)
      	  }
        </div>
      </div>
  	);
  }
}

export default App;
