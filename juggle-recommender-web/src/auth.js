import React, {Component} from 'react';
import firebase from 'firebase' 
import store from './store'
var firebaseConfig = {
    apiKey: "AIzaSyCmnOtb4Wk5MObmo1UPhgEV2Cv3b_6nMuY",
    authDomain: "skilldex-4ebb4.firebaseapp.com",
    databaseURL: "https://skilldex-4ebb4.firebaseio.com",
    projectId: "skilldex-4ebb4",
    storageBucket: "skilldex-4ebb4.appspot.com",
    messagingSenderId: "965128070479",
    appId: "1:965128070479:web:64af3cb91c057166"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

class Auth extends Component {
    actionCodeSettings = {
        url: 'https://www.straitflow.com/',
    };
    // public ui = new firebaseui.auth.AuthUI(firebase.auth());
    state= {
        loggedIn : false,
        email:"",
        id:"",
        user: null,
        username : "",
        error : ""
    }
    componentDidMount() {
        if(window.sessionStorage.getItem('user')){
            this.state.email =  window.sessionStorage.getItem('email')
            this.state.user = JSON.parse(window.sessionStorage.getItem('user'))
            this.state.username = JSON.parse(window.sessionStorage.getItem('username'))
            this.state.loggedIn = true
        }
    }
    getUserByEmail=(email)=>{
        return {
            'name': 'bollocks'
        }
    }
    RefreshUser(){
        if(this.state.loggedIn){
            return new Promise(resolve => {
                this.getUserByEmail(this.state.email).then(user=>{
                    console.log("got user")
                    /*this.state.id = user["key"]
                    this.state.user = user
                    window.sessionStorage.setItem('email',user["email"]); // user is undefined if no user signed in
                    window.sessionStorage.setItem('user',JSON.stringify(user)); // user is undefined if no user signed in
                    window.sessionStorage.setItem('username',JSON.stringify(user["username"])); // user is undefined if no user signed in
                    */
                    resolve("got user be");
                })
            })
        }
    }
    ForgotPassword(email){
        
        return new Promise(resolve => {
            firebase.auth().sendPasswordResetEmail(email, this.state.actionCodeSettings).then(()=>{
                resolve("password reset email sent")
            })
        })
    }
    LoginUser(user, pass) {
        window.sessionStorage.clear
        console.log("logging user", user, pass)
        return new Promise(resolve => {
            firebase.auth().signInWithEmailAndPassword(user, pass).then(data => {
                this.state.loggedIn = true
                this.state.email = data.user["email"]
                this.state.getUserByEmail(this.state.email).then(user=>{
                    this.state.id = user["key"]
                    this.state.user = user 
                    this.state.username = user["username"]
                    window.sessionStorage.setItem('email',user["email"]); // user is undefined if no user signed in
                    window.sessionStorage.setItem('user',JSON.stringify(user)); // user is undefined if no user signed in
                    window.sessionStorage.setItem('username',JSON.stringify(user["username"])); // user is undefined if no user signed in
                    resolve("got user");
                })
                
            }).catch(error=>{
                resolve(error)
            });
        });
    }
    
    RegisterUser(user, pass) {
        
        return new Promise(resolve => {
            console.log("registering user", user, pass)
            firebase.auth().createUserWithEmailAndPassword(user, pass).then(data =>{
                firebase.auth().currentUser.sendEmailVerification(this.state.actionCodeSettings).then(()=>{
                    resolve("user created")

                 })
            }).catch(function (error) {
                resolve(error)
            });
        })
    }
    
    SignOut() {
        return new Promise(resolve => {
            firebase.auth().signOut().then(() => {
                window.sessionStorage.clear()
                this.state.loggedIn = false
                this.state.email = ""
                this.state.id = ""
                this.state.user = {}
                this.state.username = ""
                resolve("signed out")
            });
        })
    }
    signIn=()=>{
        this.LoginUser(this.state.username, this.state.password).then((response)=>{
            console.log("done" , response)
            if(response.message){
                this.setState({
                    error : response.message
                })
            }
        })
    }
    createAccount=()=>{
        this.RegisterUser(this.state.username,this.state.password).then((response)=>{
            console.log("user registered")
            if(response.message){
                this.setState({
                    error : response.message
                })
            }
        })
    }
    
    userInputChange=(e)=>{
        this.setState({username : e.target.value})
    }
    passwordInputChange=(e)=>{
        this.setState({password : e.target.value})
    }
    render(){
        const inputStyle = {width: "200px"}
        return (   
                <div>
                    {
                        this.state.loggedIn ? 
                            <div>Signed in as {this.state.username}</div> : 
                            <div>
                                <input style={inputStyle} onChange={this.userInputChange} value={this.username}/><label>username</label>
                                <br/>
                                <input style={inputStyle} onChange={this.passwordInputChange}/><label>password</label>
                                <br/>
                                <div style={{color : "red"}}>{this.state.error}</div>
                                <button onClick={this.createAccount}>Create Account</button>
                                <button onClick={this.signIn}>Sign In</button>
                            </div>
                    }
                </div>
            )
    }

}
export default Auth