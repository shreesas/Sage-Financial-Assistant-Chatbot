import bigSage from '../assets/big_sage_profile.png';
import { SAGE_LINES } from '../data/sageFlow';

export default function EmptyState() {
  return (
    <div className="empty">
      <div className="empty__avatar" aria-hidden="true">
        <img src={bigSage} alt="" />
      </div>
      <p className="empty__intro">{SAGE_LINES.greeting}</p>
    </div>
  );
}
