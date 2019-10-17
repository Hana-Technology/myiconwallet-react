import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faInfoCircle,
} from '@fortawesome/pro-duotone-svg-icons';
import PropTypes from 'prop-types';

export const ALERT_TYPE_INFO = 'info';
export const ALERT_TYPE_SUCCESS = 'success';
export const ALERT_TYPE_WARN = 'warn';
export const ALERT_TYPE_DANGER = 'danger';
const ALERT_TYPES = [ALERT_TYPE_INFO, ALERT_TYPE_SUCCESS, ALERT_TYPE_WARN, ALERT_TYPE_DANGER];

function getIcon(type) {
  switch (type) {
    case ALERT_TYPE_SUCCESS:
      return faCheckCircle;
    case ALERT_TYPE_WARN:
      return faExclamationCircle;
    case ALERT_TYPE_DANGER:
      return faExclamationTriangle;
    case ALERT_TYPE_INFO:
    default:
      return faInfoCircle;
  }
}

function getColors(type) {
  switch (type) {
    case ALERT_TYPE_SUCCESS:
      return 'bg-green-100 text-green-700 border-green-500';
    case ALERT_TYPE_WARN:
      return 'bg-orange-100 text-orange-700 border-orange-500';
    case ALERT_TYPE_DANGER:
      return 'bg-red-100 text-red-700 border-red-500';
    case ALERT_TYPE_INFO:
    default:
      return 'bg-blue-100 text-blue-700 border-blue-500';
  }
}

function Alert({ type, text, title, className, showIcon = true }) {
  return (
    <div className={`border-l-4 px-4 py-3 ${getColors(type)} ${className || ''}`} role="alert">
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-none text-3xl -mt-1 -ml-2 mr-2">
            <FontAwesomeIcon icon={getIcon(type)} fixedWidth />
          </div>
        )}
        <div>
          {title && <div className="font-bold leading-tight">{title}</div>}
          {text && <div className="leading-tight">{text}</div>}
        </div>
      </div>
    </div>
  );
}

Alert.propTypes = {
  type: PropTypes.oneOf(ALERT_TYPES).isRequired,
  text: PropTypes.node,
  title: PropTypes.node,
  className: PropTypes.string,
  showIcon: PropTypes.bool,
};

export default Alert;
