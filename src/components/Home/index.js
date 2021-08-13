import React, { Component } from "react";

import { AuthUserContext, withAuthorization } from "../Session";
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
      limit: 5,
      messages: [],
    };
  }

  componentDidMount() {
    this.onListenForMessages();
  }

  onListenForMessages() {
    this.setState({ loading: true });

    this.unsubscribe = this.props.firebase
      .messages()
      .orderBy("createdAt", "desc")
      .limit(this.state.limit)
      .onSnapshot((snapshot) => {
        if (snapshot.size) {
          let messages = [];
          snapshot.forEach((doc) =>
            messages.push({ ...doc.data(), uid: doc.id })
          );

          this.setState({ messages: messages.reverse(), loading: false });
        } else {
          this.setState({ messages: null, loading: false });
        }

        this.setState({ loading: false });
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onChangeText = (event) => {
    this.setState({ text: event.target.value });
  };

  onCreateMessage = (event, authUser) => {
    this.props.firebase.messages().push({
      text: this.state.text,
      userId: authUser.uid,
      createdAt: this.props.firebase.serverValue.TIMESTAMP,
    });

    this.setState({ text: "" });

    event.preventDefault();
  };

  onRemoveMessage = (uid) => {
    this.props.firebase.message(uid).remove();
  };

  onEditMessage = (message, text) => {
    const { uid, ...messageSnapshot } = message;

    this.props.firebase.message(
      message(uid).set({
        ...messageSnapshot,
        text,
        editedAt: this.props.firebase.serverValue.TIMESTAMP,
      })
    );
  };

  onNextPage = () => {
    this.setState(
      (state) => ({ limit: state.limit + 5 }),
      this.onListenForMessages
    );
  };

  render() {
    const { text, messages, loading } = this.state;

    return (
      <AuthUserContext.Consumer>
        {(authUser) => (
          <div>
            {!loading && messages && (
              <button type="button" onClick={this.onNextPage}>
                More
              </button>
            )}
            {loading && <div>Loading...</div>}

            {messages ? (
              <MessageList
                authUser={authUser}
                messages={messages}
                onEditMessage={this.onEditMessage}
                onRemoveMessage={this.onRemoveMessage}
              />
            ) : (
              <div>There are no messages...</div>
            )}

            <form onSubmit={(event) => this.onCreateMessage(event, authUser)}>
              <input type="text" value={text} onChange={this.onChangeText} />
              <button type="submit">Send</button>
            </form>
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const MessageList = ({
  authUser,
  messages,
  onEditMessage,
  onRemoveMessage,
}) => (
  <ul>
    {messages.map((message) => (
      <li>
        <MessageItem
          authUser={authUser}
          key={MessageItem.uid}
          message={message}
          onEditMessage={this.onEditMessage}
          onRemoveMessage={this.onRemoveMessage}
        />
      </li>
    ))}
  </ul>
);

class MessageItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      editText: this.props.message.text,
    };
  }

  onToggleEditMode = () => {
    this.setState((state) => ({
      editMode: !state.editMode,
      editText: this.props.message.text,
    }));
  };

  onChangeEditText = (event) => {
    this.setState({ editText: event.target.value });
  };

  onSaveEditText = () => {
    this.props.onEditMessage(this.props.message, this.state.editText);

    this.setState({ editMode: false });
  };

  render() {
    const { authUser, message, onRemoveMessage } = this.props;
    const { editMode, editText } = this.state;

    return (
      <li>
        {editMode ? (
          <input
            type="text"
            value={editText}
            onChange={this.onChangeEditText}
          />
        ) : (
          <span>
            <strong>{message.userId}</strong> {message.text}
            {message.editedAt && <span>(Edited)</span>}
          </span>
        )}

        {!editMode && (
          <button type="button" onClick={() => onRemoveMessage(message.uid)}>
            Delete
          </button>
        )}

        {authUser.uid === message.userId && (
          <span>
            {editMode ? (
              <span>
                <button onClick={this.onSaveEditText}>Save</button>
                <button onClick={this.onToggleEditText}>Reset</button>
              </span>
            ) : (
              <button onClick={this.onToggleEditText}>Edit</button>
            )}
          </span>
        )}
      </li>
    );
  }
}

const Messages = withFirebase(MessageBase);
const condition = (authUser) => !!authUser;

export default withAuthorization(condition)(HomePage);
