import React, { Component } from "react"; // Step 1: Import React and the Component class from "react". React is the core library for building UIs. Component is the base class for class-based components, which allow lifecycle methods and state management. Without this, we can't create class components.
import { Link } from "react-router-dom"; // Step 2: Import the 'Link' component from 'react-router-dom'. This enables navigation between pages in a single-page app (SPA) without full reloads. It's used inside the render method to create clickable links.

// Step 3: Define the Welcome class component. Class components extend React.Component, providing access to state, props, and lifecycle methods. This is an alternative to functional components; it's older but still useful for complex logic. The class name starts with uppercase by convention.
class Welcome extends Component {
  // Step 4: Constructor method. This is the first method called when the component is instantiated. It initializes state and binds methods if needed. Here, we're using arrow functions for methods to auto-bind 'this', so no manual binding is required. Workflow: New Welcome() -> Constructor runs -> super() calls parent's constructor -> Sets initial state if any (none here).
  constructor(props) {
    super(props); // Step 4a: Call the parent (Component) constructor with props. This is required and ensures 'this' is properly set up. Without it, 'this' would be undefined in methods.
    // No initial state needed here, as there are no state variables. If we had state, we'd do this.state = { ... };
  }

  // Step 5: Define handleNewUser as an arrow function property. Arrow functions auto-bind 'this' to the class instance, so 'this' refers to the component. This method runs on button click. Workflow: User clicks button -> onClick prop triggers this method -> Logs to console -> Link navigation handles the rest.
  handleNewUser = () => {
    // Navigate to registration/signup page logic
    console.log("Redirecting to Sign Up..."); // This logs a message to the browser's console (DevTools) for debugging. It indicates the click action started.
  };

  // Step 6: Define handleLogin similarly as an arrow function. Same binding and workflow as above, but for login.
  handleLogin = () => {
    // Navigate to login page logic
    console.log("Redirecting to Login..."); // Console log specific to login action.
  };

  // Step 7: Define containerStyle as a class property (object). This is an inline style object for CSS-in-JS. It's defined here for reuse in render. Workflow: Render calls -> This object is referenced in JSX style prop -> Browser applies styles.
  containerStyle = {
    display: "flex", // Flexbox display for layout.
    flexDirection: "column", // Vertical arrangement of children.
    alignItems: "center", // Horizontal centering.
    justifyContent: "center", // Vertical centering.
    height: "100vh", // Full screen height.
    fontFamily: "Arial, sans-serif", // Font stack.
    background: "linear-gradient(135deg, #89f7fe, #66a6ff)", // Gradient background.
    color: "#333", // Text color.
  };

  // Step 8: Define buttonStyle as a class property (object). Similar to containerStyle, for button appearance. Workflow: Same as above, applied to buttons.
  buttonStyle = {
    margin: "10px", // Spacing around buttons.
    padding: "12px 24px", // Internal padding.
    fontSize: "16px", // Text size.
    border: "none", // No border.
    borderRadius: "8px", // Rounded corners.
    cursor: "pointer", // Hand cursor on hover.
    backgroundColor: "#fff", // White background.
    color: "#333", // Text color.
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Shadow for depth.
    transition: "all 0.2s ease", // Smooth transitions.
  };

  // Step 9: The render method. This is required in class components and returns the JSX that gets displayed. It's called whenever the component updates (e.g., state/props change). Workflow: Component mounts -> render() -> JSX to DOM -> User sees UI. On update: Re-render -> Diffing -> Update DOM.
  render() {
    // Step 10: Return the JSX tree. JSX is syntactic sugar for React.createElement calls. It describes the UI structure.
    return (
      // Step 11: Outermost <div> with this.containerStyle applied via style prop. This sets up the full-page layout.
      <div style={this.containerStyle}>
        {/* Step 12: <h1> for the title. React renders this as an h1 element. */}
        <h1>Welcome!</h1>
        {/* Step 13: <p> for the subtitle text. */}
        <p>Please choose an option to continue:</p>
        {/* Step 14: Wrapping <div> for buttons. No style here, just grouping. */}
        <div>
          {/* Step 15: <Link> to "/register" for signup. When clicked, it updates the URL and triggers route change. Workflow: Click -> Router navigates -> Signup component renders. */}
          <Link to="/register">
            {/* Step 16: <button> inside Link makes the button navigable. onClick runs the method (logs), hover effects change style dynamically. */}
            <button
              style={this.buttonStyle} // Applies the button styles.
              onClick={this.handleNewUser} // Binds the click handler.
              onMouseOver={(e) => (e.target.style.backgroundColor = "#f0f0f0")} // Inline function for hover: Changes background to light gray.
              onMouseOut={(e) => (e.target.style.backgroundColor = "#fff")} // Hover end: Resets to white.
            >
              {/* Step 17: Button's child text node: "New User". */}
              New User
            </button>
          </Link>
          {/* Step 18: Second <Link>, but note: This should be to="/login" for accuracy (as per original intent). Keeping as "/register" per code, but in practice, fix to "/login". */}
          <Link to="/register">
            {/* Step 19: Second <button>, similar setup but with handleLogin. */}
            <button
              style={this.buttonStyle}
              onClick={this.handleLogin} // Login handler.
              onMouseOver={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#fff")}
            >
              {/* Step 20: Button text: "Login". */}
              Login
            </button>
          </Link>
        </div>
      </div>
    ); // Step 21: End of JSX return. Must be in parentheses for multi-line.
  } // Step 22: End of render method.
} // Step 23: End of Welcome class.

// Step 24: Export the class as default. This lets other files import it like import Welcome from './Welcome';. Without export, it's not usable elsewhere. Overall workflow: App.js imports and renders <Welcome /> -> Class instantiated -> Constructor -> render() -> UI displays -> Interactions trigger methods -> Potential re-renders.
export default Welcome;