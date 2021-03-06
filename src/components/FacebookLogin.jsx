import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { FacebookProvider, Login } from "react-facebook";
import { Button, Icon } from "semantic-ui-react";
import axios from "axios";
import { Redirect } from "react-router";
import { getTrips } from "../modules/destination.js";

const FacebookLogin = props => {
  const [redirect, setRedirect] = useState(false);
  const [redirectToTrip, setRedirectToTrip] = useState(false);
  const [localStorageExists, setlocalStorageExists] = useState(false);
  const [gotTrips, setGotTrips] = useState(false)
  const [userTripsExist, setUserTripsExist] = useState(null)

  const handleResponse = async data => {
    const response = await axios.post("/auth", {
      uid: data.profile.id,
      email: data.profile.email,
      provider: "facebook"
    });
    if (response.status === 200) {
      if (props.currentRoute === "landing") {
        props.setCurrentUser(data.profile);
        props.changeAuth(true);
        setlocalStorageExists(true);
        // props.setCurrentRoute("trip");
        setSession(response.data, response.headers);
        getTripsData();
        // setRedirectToTrip(true);
      } else {
        props.setCurrentUser(data.profile);
        props.setCurrentRoute("trip");
        props.changeAuth(true);
        setSession(response.data, response.headers);
        props.updateProgression(props.progression + 1);
      }
    }
  };

  const setSession = (data, headers) => {
    const storageKey = "J-sunkAuth-Storage";
    const session = {
      ["access-token"]: data["auth_token"],
      ["cache-control"]: headers["cache-control"],
      client: data["client_id"],
      ["content-type"]: headers["content-type"],
      ["token-type"]: "Bearer",
      expiry: data["expiry"],
      uid: data["uid"]
    };
    localStorage.setItem(storageKey, JSON.stringify(session));
  };

  const createTripHandler = async () => {
    props.setCurrentRoute("trip");
    setRedirectToTrip(true);
  };

  const getTripsData = async () => {
    let response = await getTrips();
    if (response.status === 200) {
      if (response.data.length === 0) {
        setUserTripsExist(0)
      } else {
        setUserTripsExist(1);
      }
    }
  };
  
  useEffect(() => {
    if (localStorage.getItem("J-sunkAuth-Storage")) {
      setlocalStorageExists(true);
      props.updateProgression(0);
      getTripsData()
    }
  }, []);

  useEffect(() => {
    if (props.logout === true) {
      setlocalStorageExists(false);
    }
  }, [props.logout]);

  useEffect(() => {
    if (props.authenticated === true && userTripsExist === 0) {
      props.setCurrentRoute("trip");
      setRedirectToTrip(true);
      // props.updateProgression(0);
    }
  }, [userTripsExist]);

  return (
    <>
      <div className="fb-login">
        {redirect === true && <Redirect to="/result" />}
        {redirectToTrip === true && <Redirect to="/trip" />}
        <h2 style={{ paddingBottom: "40px" }}>To get started:</h2>
        {localStorageExists === false ? (
          <FacebookProvider appId="175176387099386">
            <Login scope="email" onCompleted={handleResponse}>
              {({ loading, handleClick }) => (
                <Button
                  id="login-button"
                  size="massive"
                  color="facebook"
                  onClick={handleClick}
                >
                  <Icon name="facebook" />
                  {!loading && `Login with Facebook`}
                  {loading && `Loading...`}
                </Button>
              )}
            </Login>
          </FacebookProvider>
        ) : (
          <Button id="create-trip-button-landing" onClick={createTripHandler}>
            Create Trip!
          </Button>
        )}
      </div>
      {userTripsExist === 1 && (
        <Button
          id="return-button"
          size="large"
          color="grey"
          onClick={() => setRedirect(true)}
        >
          {" "}
          Dashboard
        </Button>
      )}
    </>
  );
};

const mapStateToProps = state => {
  return {
    progression: state.progression,
    currentUser: state.currentUser,
    currentRoute: state.currentRoute,
    authenticated: state.authenticated,
    logout: state.logout
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeAuth: auth => {
      dispatch({ type: "CHANGE_AUTHENTICATED", payload: auth });
    },
    updateProgression: value => {
      dispatch({ type: "UPDATE_PROGRESSION", payload: value });
    },
    setCurrentUser: data => {
      dispatch({ type: "SET_CURRENTUSER", payload: data });
    },
    setCurrentRoute: route => {
      dispatch({ type: "SET_CURRENROUTE", payload: route });
    },
    setLogout: value => {
      dispatch({ type: "SET_LOGOUT", payload: value });
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FacebookLogin);
