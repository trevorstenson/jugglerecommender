import React, {Component} from 'react';
import { observer } from "mobx-react"
import './App.css';
import TrickList from './trickList.js'
import Detail from './detail.js'
import store from './stores/store'
import uiStore from './stores/uiStore'
import authStore from './stores/authStore.js'
import Modal from 'react-modal';
import SlidingPane from 'react-sliding-pane';
import 'react-sliding-pane/dist/react-sliding-pane.css';
import firebase from 'firebase' 
import AddTrickForm from './addTrickForm'
import HomeScreen from './homeScreen'
import Login from "./login"
import CreateAccount from "./createAccount"
import ForgotPassword from "./forgotPassword"
import Header from "./header"
import Stats from "./stats"
import Profile from "./profile"
import ReactGA from 'react-ga'
import Filter from './filter'
import { withRouter, Router } from 'react-router-dom';
import history from "./history"

const unlisten = history.listen((location, action) => {
  // location is an object like window.location
  if(location.state && location.state.detail != uiStore.detailTrick){
  	if(uiStore.addingTrick){
	 	uiStore.toggleAddingTrick()
	}
  	const detailTrick = {...store.library[location.state.detail]}
	detailTrick.id = location.state.detail
  	uiStore.setDetailTrick(detailTrick)	

  }
  if(location.pathname == "/home" || location.pathname == "/" ){
  	uiStore.clearUI()
	uiStore.setShowHomeScreen(true)
	if(uiStore.addingTrick){
	 	uiStore.toggleAddingTrick()
	}
  }
  if(location.pathname == "/tricklist"){
  	uiStore.clearUI()
	if(uiStore.addingTrick){
	 	uiStore.toggleAddingTrick()
	}
  } 
    if(location.pathname == "/stats"){
  	uiStore.clearUI()
  	uiStore.setShowStatsScreen(true)
	if(uiStore.addingTrick){
	 	uiStore.toggleAddingTrick()
	}
  }  
    if(location.pathname == "/profile"){
  	uiStore.clearUI()
  	uiStore.setShowProfileScreen(true)
	if(uiStore.addingTrick){
	 	uiStore.toggleAddingTrick()
	}
  } if(location.pathname == "/addpattern"){
	uiStore.clearUI()
	if(uiStore.addingTrick){
	 	uiStore.toggleAddingTrick()
	}
  }  
});

let firebaseConfig = {}
if(store.isLocalHost){
	firebaseConfig = {
		apiKey: "AIzaSyA_3_UUnQ0iII4jblL4Nf6OLALpH1AbaKQ",
		authDomain: "skilldex-dev-6c0ff.firebaseapp.com",
		databaseURL: "https://skilldex-dev-6c0ff.firebaseio.com",
		projectId: "skilldex-dev-6c0ff",
		storageBucket: "skilldex-dev-6c0ff.appspot.com",
		messagingSenderId: "224766397892",
		appId: "1:224766397892:web:80beef32563065c3"
	};
}else{
	ReactGA.initialize('UA-140392015-1');
	ReactGA.pageview(window.location.pathname + window.location.search);
	
	firebaseConfig = {
    apiKey: "AIzaSyCmnOtb4Wk5MObmo1UPhgEV2Cv3b_6nMuY",
    authDomain: "skilldex-4ebb4.firebaseapp.com",
    databaseURL: "https://skilldex-4ebb4.firebaseio.com",
    projectId: "skilldex-4ebb4",
    storageBucket: "skilldex-4ebb4.appspot.com",
    messagingSenderId: "965128070479",
    appId: "1:965128070479:web:64af3cb91c057166"
  };
}
//loaded with a shared URL
if (window.location.search.includes("?")){
	uiStore.setShowHomeScreen(false)
}
const ESCAPE_KEY = 27;

firebase.initializeApp(firebaseConfig);

@observer
class App extends Component {
 	state = {
 		filters : [],
 		selectedList : "allTricks",
 		edges : [],
 		nodes : [],
 		isInstructionsPaneOpen: false,
 		isCreateAccountPaneOpen: false,
 		isForgotPasswordPaneOpen : false,
	}
	_handleKeyDown = (event) => {
	    switch( event.keyCode ) {
	        case ESCAPE_KEY:
	            if (uiStore.addingTrick){
	            	uiStore.toggleAddingTrick()
					uiStore.handleBackButtonClick()
	            }
	            break;
	        default: 
	            break;
	    }
	}
	componentDidMount(){
		const date = new Date()
		store.setStartTime(date.getTime())
		document.addEventListener("keydown", this._handleKeyDown);
		store.getSavedTricks()	
		Modal.setAppElement(this.el);
		firebase.auth().onAuthStateChanged(function(user) {
			console.log("user check" ,user)
          if (user && !authStore.user) {
            console.log("user auth changed", user)
            authStore.setUsername(user.email)
          }
        });
		if(window.location.host.includes("localhost")){
			//store.initializeLibrary()
		}
		if(window.location.host.includes("localhost")){
			//store.initializeTags()
		}
		this.setPageBasedOnUrl()
		store.getTagsFromDatabase()
		store.getUserCountFromDatabase()
		store.getTotalCatchCountFromDatabase()
		
	}
	setPageBasedOnUrl=()=>{
		store.getLibraryFromDatabase().then(()=>{
			if(window.location.pathname.includes("detail")){
			  	let match = window.location.pathname.match('/detail\/(.+)')
			  	let trickKey = 'error'
			  	if(match.length>0){
				  	trickKey = match[1].replace(/%20/g, ' ')
				}
			  	if (store.library[trickKey]){
				  	const detailTrick = {...store.library[trickKey]}
					detailTrick.id = trickKey
				  	uiStore.setDetailTrick(detailTrick)				  		
			  	}else{
					alert("There is no page for that trick.")
					uiStore.clearUI()
					uiStore.setShowHomeScreen(true)
					if(uiStore.addingTrick){
					 	uiStore.toggleAddingTrick
					}
				}
			}
			if(window.location.pathname.includes("home")){
			  	uiStore.clearUI()
				uiStore.setShowHomeScreen(true)
				if(uiStore.addingTrick){
				 	uiStore.toggleAddingTrick()
				}
			}
			if(window.location.pathname.includes("tricklist")){
			  	uiStore.clearUI()
				if(uiStore.addingTrick){
				 	uiStore.toggleAddingTrick()
				}
			} 
			if(window.location.pathname.includes("stats")){
			  	uiStore.clearUI()
			  	uiStore.setShowStatsScreen(true)
				if(uiStore.addingTrick){
				 	uiStore.toggleAddingTrick()
				}
			}  
		    if(window.location.pathname.includes("profile") && authStore.user){
			    if (authStore.user){
				  	uiStore.clearUI()
				  	uiStore.setShowProfileScreen(true)
					if(uiStore.addingTrick){
					 	uiStore.toggleAddingTrick()
					}
				}else{
					history.push('/home')
					uiStore.clearUI()
					uiStore.setShowHomeScreen(true)
					if(uiStore.addingTrick){
					 	uiStore.toggleAddingTrick()
					}
				}
			}
		  	if(window.location.pathname.includes("addpattern")){
			    if (authStore.user){
					uiStore.clearUI()
					if(uiStore.addingTrick){
					 	uiStore.toggleAddingTrick()
					}
		  		}else{
					history.push('/home')
					uiStore.clearUI()
					uiStore.setShowHomeScreen(true)
					if(uiStore.addingTrick){
					 	uiStore.toggleAddingTrick()
					}
				}
			}  	
		})
	}
 	toggleFilter =(filter)=>{
 		let newFilters = []
 		if(!this.state.filters.includes(filter)){
 			newFilters.push(filter)
 		}
 		this.state.filters.forEach((curFilter)=>{
 			if(curFilter !== filter){
 				newFilters.push(curFilter)
 			} 			
 		})
 		this.setState({
 			filters : newFilters
 		})
 	} 	
 	openSlidingPane=(paneName)=>{
 		if (paneName === 'isLoginPaneOpen'){
	 		store.setIsLoginPaneOpen(true)
	 	}else if(paneName === 'isInstructionsPaneOpen'){
	 		//window.history.pushState("list", "list page", "localhost:3000/list")
	 		this.setState({ 'isInstructionsPaneOpen': true })
	 	}else if(paneName === 'isCreateAccountPaneOpen'){
	 		this.setState({ 'isCreateAccountPaneOpen': true })
	 	}else if(paneName === 'isForgotPasswordPaneOpen'){
	 		store.toggleForgotPasswordPane()
	 	}
 	}

 	render(){
	    window.onclick = function(event) {
	        if (uiStore.showSortDiv && !uiStore.mouseInSortDiv && !uiStore.sortTimer){
	            uiStore.setShowSortDiv(false)
	        }
	        if (uiStore.showExpandedMenu && 
	        	!uiStore.mouseInExpandedMenu && !uiStore.expandedMenuTimer){
	            uiStore.setShowExpandedMenu(false)
	        }
	    }
     
 		const instructions = <SlidingPane
				                className='some-custom-class'
				                overlayClassName='some-custom-overlay-class'
				                isOpen={ this.state.isInstructionsPaneOpen }
				                title='About'
				                onRequestClose={ () => {
				                    this.setState({ isInstructionsPaneOpen: false });}}>
				                <div className="instructions">
				                	<h2>About Skilldex</h2>
										<span className="info">
											• Find new trick to learn<br/>
											• Track catches for tricks you know<br/>
											• Share new tricks with the Skilldex community
										</span>
									<br/>
				                	<h2>Instructions</h2>
									<span className="info">
										• Tricks and their relationships are represented by a graph<br/>
										• An arrow connecting two tricks shows that the first trick is prerequisite for the second<br/>
										• ★ Star tricks you know to add to "Starred" tricks.<br/>
										• Find new tricks to learn next that are related to tricks you starred.
									</span>
									<br/>
									<span className="info">Seeded from <a target="_" href="http://www.libraryofjuggling.com">libraryofjuggling.com</a></span>
									<br/>
									<h2>Contact</h2>
									<div className="info" >
										<a style={{"color":"blue"}}>www.instagram.com/skilldex.app/</a><br/>
										<a style={{"color":"blue"}}>skilldex.feedback@gmail.com</a>
									</div>
								</div><br/>
				            </SlidingPane> 

		const login = 	<SlidingPane
			                className='some-custom-class'
			                overlayClassName='some-custom-overlay-class'
			                isOpen={ store.isLoginPaneOpen }
			                title='Login'
			                onRequestClose={ 
			                	() => {store.setIsLoginPaneOpen(false)}
			                }>
			                <div className="instructions">
			                	<Login/><br/>
							</div><br/>
			            </SlidingPane>

		const createAccount = <SlidingPane
			                className='some-custom-class'
			                overlayClassName='some-custom-overlay-class'
			                isOpen={ store.isCreateAccountPaneOpen }
			                title='Create Account'
			                onRequestClose={ 
			                	() => {store.toggleCreateAccountPane()}
			                }>
			                <div className="instructions">
			                	<CreateAccount/><br/>
							</div><br/>
			            </SlidingPane>
		const forgotPassword = <SlidingPane
					                className='some-custom-class'
					                overlayClassName='some-custom-overlay-class'
					                isOpen={ store.isForgotPasswordPaneOpen }
					                title='Forgot Password'
					                onRequestClose={ 
					                	() => {store.toggleForgotPasswordPane()}
					                }>
					                <div className="instructions">
					                	<ForgotPassword/><br/>
									</div><br/>
					            </SlidingPane>
		const detail = uiStore.editingDetailTrick ? null : 
						uiStore.detailTrick ? <Detail/> : null
		return (
			<div
				className="main" 
				ref={ref => this.el = ref}>            
	            {instructions}
	            {login}
	            {createAccount}
	            {forgotPassword}
				<Header openSlidingPane={this.openSlidingPane}/>
				{!this.state.isInstructionsPaneOpen && 
					!store.isLoginPaneOpen  && 
					!store.isCreateAccountPaneOpen && 
					!uiStore.showHomeScreen &&
					!uiStore.showStatsScreen &&
					!uiStore.showProfileScreen &&
					uiStore.detailTrick == null ?
					
						<TrickList 
							tricksToList = {uiStore.rootTricks}
							listType = "main"
						/>
					 : null
				}
				{uiStore.showProfileScreen?<Profile/>: null}
				{uiStore.showStatsScreen?<Stats/>: null}
				
				{uiStore.showHomeScreen && !uiStore.detailTrick ? <HomeScreen/> : null}	
				{detail}
				
				{uiStore.showFilterDiv?<Filter/>: null}
				{uiStore.addingTrick ? <AddTrickForm/> : null}
			</div>
		);
	}
}
export default App;
