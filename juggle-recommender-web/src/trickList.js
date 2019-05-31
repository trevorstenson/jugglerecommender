import React,{Component} from 'react'
import {jugglingLibrary} from './jugglingLibrary.js'
import store from './store'
import uiStore from './uiStore'
import filterStore from './filterStore'
import graphStore from './graphStore'
import { observer } from "mobx-react"
import legendImg from './greenToRedFade.jpg'
import sortIcon from './sortIcon.png'
import filterIcon from './filterIcon.png'
import './trickList.css';
import './App.css';
import {TAGS} from './tags';
import { WithContext as ReactTags } from 'react-tag-input';
import Filter from './filter.js'

const suggestions = TAGS.map((country) => {
  return {
    id: country,
    text: country
  }
})

const KeyCodes = {
  comma: 188,
  enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

@observer
class TrickList extends Component {
	state = {
			sortType: 'alphabetical',
			listIsMinimized: false,
			showSortMenu : false
	}

	sortOptionClicked=(type)=>{
		this.setState({sortType : type})
	}
	toggleShowSort=()=>{
		this.setState({showSortMenu:!this.state.showSortMenu})
	}
	recordScrollerPosition=(nums)=>{
		let expSecPos = {...this.state.expandedSectionsPositions};
		for (const num of nums){		
			if(document.getElementById('trickList'+num)){
				expSecPos[num] = document.getElementById('trickList'+num).scrollTop
			}
		}
		this.setState({'expandedSectionsPositions':expSecPos})
		this.setState({'listIsMinimized':true})
	}

	setListExpanded=()=>{
		if (uiStore.listExpanded){
			this.recordScrollerPosition(['3','4','5'])
			this.setState({'listIsMinimized':true})
			uiStore.setListExpanded(!uiStore.listExpanded)
		}else{
			this.setState({'listIsMinimized':false})
			uiStore.setListExpanded(!uiStore.listExpanded)
		}						
	}

	setScrollerPositions=()=> {
		const nums = ['3','4','5']
		for (var i = 0; i <3; i++){
			const num = nums[i]
		 	const expPos = this.state.expandedSectionsPositions[num]
		    function setPositions() {
				if(document.getElementById('trickList'+num)){
	    			document.getElementById('trickList'+num).scrollTop = expPos
				}
			}
		    setTimeout(function() {
		        setPositions();
		    }, 100);
		}
	}



	componentDidUpdate=(prevProps, prevState, snapshot)=> {
		if (prevState.listIsMinimized && !this.state.listIsMinimized){
		  this.setScrollerPositions()
		}
	}


render() {
	 window.onclick = function(event) {
 	 	if (event.srcElement['alt'] !== 'showSortMenu') {
 	 		if (document.getElementById("myDropdown")){
 				if (document.getElementById("myDropdown").classList.contains('show')){
 					uiStore.toggleSortTypeShow()
 				}
 			}
 		}
 	}
	const { tags, suggestions } = this.state;
 			//NEXT: can maybe use the stuff above to set the store. sort menu current state, like 
 			//	how showSortMenu does it, but  alittle different
 	const sortDropdown = this.state.showSortMenu ? 
 					<div title="sort" id="myDropdown" className="sortDropdown">
				    	<button className="sortDropdownButtonDif" onClick={(e)=>this.sortOptionClicked('difficulty')}>Difficulty</button>
				    	<button className="sortDropdownButtonAlph" onClick={(e)=>this.sortOptionClicked('alphabetical')}>A->Z</button>
					  </div> : null

	const sort = <img src={sortIcon} alt="showSortMenu" 
					 onClick={this.toggleShowSort} height='25px'width='25px'/>

	const filter = <img src={filterIcon} alt="showFilterMenu" 
					 onClick={()=>{filterStore.toggleFilterDiv()}} height='25px'width='25px'/>					 
					 
					  
				
 	let tricks = []

 	const rootTricks = uiStore.rootTricks
	for (var i = 0; i < rootTricks.length; i++) {
		const trick = jugglingLibrary[rootTricks[i]]
		const trickKey = rootTricks[i]
		var cardClass='listCard'
		if(this.props.selectedTricks && this.props.selectedTricks.includes(trickKey)){
			cardClass = 'selectedListCard'
		}
		const cardColor = 
			graphStore.getInvolvedNodeColor(trick.difficulty, 2).background == "white" ? 
			graphStore.getInvolvedNodeColor(trick.difficulty, 2).border :
		 	graphStore.getInvolvedNodeColor(trick.difficulty, 2).background 					
		tricks.push(
			<div onClick={()=>{uiStore.selectTricks([trickKey])}} 
				className={cardClass} 
				key={trickKey + "div"} 
				style={{backgroundColor: cardClass === 'listCard' ? cardColor : 
					graphStore.getSelectedInvolvedNodeColor(trick.difficulty, 2).background}}>
				 {store.myTricks[trickKey] ? 
					 <button className="addAndRemoveMyTricksButton" 
					 		onClick={(e)=>{store.removeFromMyTricks(trickKey);
					 		e.stopPropagation()}}>&#9733;</button> :
				 <button className="addAndRemoveMyTricksButton" 
				 		onClick={(e)=>{store.addToMyTricks(trickKey);
				 		e.stopPropagation()}}>&#9734;</button>}
				 <span className="listCardName" title={trick.name}>{trick.name}</span>			
			</div>
		)	
	}

 	const buttons = <div>
					 	<label style={{"fontSize":"30px",
										"textAlign" : "right", 
										"paddingRight" : "15px",
										"display" : "block"}} 
								onClick={() => this.setListExpanded()}>{uiStore.listExpanded ? "-" : "+"}</label>
				 		<div className="listButtonDiv">
							<button className={uiStore.selectedList === "myTricks" ? 
									"selectedListButton" : "unselectedListButton" } 
									onClick={()=>{uiStore.setSelectedList("myTricks")}}>
									★Starred</button>
							<button className={uiStore.selectedList === "allTricks" ?
								 "selectedListButton" : "unselectedListButton" } 
								 onClick={()=>{uiStore.setSelectedList("allTricks")}}>
								 All</button>
						</div>
			 			<div className="search" >
			 				<input onChange={uiStore.searchInputChange}/>
				 			{filter}
							{sort}
							{sortDropdown}

				 		</div>
			 		</div>


	return (
		<div>	
			<div className="listDiv">		
				{!uiStore.listExpanded && !this.state.listIsMinimized ? this.recordScrollerPosition(['3','4','5']) : null}				
		 		{uiStore.listExpanded ? 
					<div>
					 	{buttons}
						<div style={{height:"100%"}}>
							<label style={{float:"left"}}>easy</label>
							<label style={{float:"right", paddingRight:"5px"}}>hard</label>
							<img style={{}}src={legendImg} alt="legendImg" width="97%"/>						
							<br></br>							
							<div id='trickList' 
								className={tricks.length > 1 ? "listSection" : ""}> 
							{tricks}
							</div>						
						</div>
					</div> : 
					buttons}
			</div>
			{filterStore.filterVisible?
			<Filter/>
			: null}
		</div>
	)
  }
}
export default TrickList