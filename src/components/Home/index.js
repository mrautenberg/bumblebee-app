import React, { Component } from "react";

import { withAuthorization } from "../Session";
import { withFirebase } from "../Firebase";

const HomePage = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <p>The Home Page is accesible by every signed in user.</p>

      <Messages />
    </div>
  );
};

class MessageBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: "",
      loading: false,
      messages: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.messages().on("value", (snapshot) => {
      const messageObject = snapshot.val();

      if (messageObject) {
        // convert messages list from snapshot
        const messageList = Object.keys(messageObject).map((key) => ({
          ...messageObject[key],
          uid: key,
        }));

        this.setState({ messages: messageList, loading: false });
      } else {
        this.setState({ messages: null, loading: false });
      }

      this.setState({ loading: false });
    });
  }

  componentWillUnmount() {
    this.props.firebase.messages().off();
  }

  onChangeText = (event) => {
    this.setState({ text: event.target.value });
  };

  onCreateMessage = (event) => {
    this.props.firebase.messages().push({
      text: this.state.text,
    });

    this.setState({ text: "" });

    event.preventDefault();
  };

  render() {
    const { text, messages, loading } = this.state;

    return (
      <div>
        {loading && <div>Loading...</div>}

        {messages ? (
          <MessageList messages={messages} />
        ) : (
          <div>There are no messages...</div>
        )}

        <form onSubmit={this.onCreateMessage}>
          <input type="text" value={text} onChange={this.onChange} />
          <button type="submit">Send</button>
        </form>
      </div>
    );
  }
}

const MessageList = ({ messages }) => {
  <ul>
    {messages.map((message) => (
      <li>
        <MessageItem key={MessageItem.uid} message={message} />
      </li>
    ))}
  </ul>;
};

const MessageItem = ({ message }) => (
  <li>
    <strong>{message.userId}</strong> {message.text}
  </li>
);

const Messages = withFirebase(MessageBase);
const condition = (authUser) => !!authUser;

export default withAuthorization(condition)(HomePage);
