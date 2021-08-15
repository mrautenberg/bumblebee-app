import React from "react";
import { compose } from "recompose";

import { withAuthorization } from "../Session";
import Messages from "../Messages";

const HomePage = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <p>The Home Page is accesible by every signed in user.</p>

      <Messages />
    </div>
  );
};

const condition = (authUser) => !!authUser;

export default compose(withAuthorization(condition))(HomePage);
