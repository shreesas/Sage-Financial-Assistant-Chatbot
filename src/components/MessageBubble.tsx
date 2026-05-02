import type { ReactNode } from 'react';
import sageAvatar from '../assets/small_sage_profile.svg';
import userAvatar from '../assets/small_user_profile.svg';
import type { Message } from '../types';

type Props = {
  message: Message;
  children?: ReactNode;
};

export default function MessageBubble({ message, children }: Props) {
  const isSage = message.speaker === 'sage';
  return (
    <div className={`msg msg--${isSage ? 'sage' : 'user'}`}>
      {isSage && (
        <span className="msg__avatar-wrap">
          <div className="msg__avatar msg__avatar--sage" aria-hidden="true">
            <img src={sageAvatar} alt="" />
          </div>
        </span>
      )}
      <div className="msg__body">
        {message.text && <div className="msg__text">{message.text}</div>}
        {children}
      </div>
      {!isSage && (
        <span className="msg__avatar-wrap">
          <div className="msg__avatar msg__avatar--user" aria-hidden="true">
            <img src={userAvatar} alt="" />
          </div>
        </span>
      )}
    </div>
  );
}
