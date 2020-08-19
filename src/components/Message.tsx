import React from 'react';

type MessageProps = {
  message: string;
};

const Message: React.FC<MessageProps> = ({ message }) =>
  <div className="message">{message}</div>;

export default Message;