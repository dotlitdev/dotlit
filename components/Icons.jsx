import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faPlay, faEdit, faTimes, faSave } from '@fortawesome/free-solid-svg-icons'

export const Icon = (props) => {
  return <FontAwesomeIcon icon={props.name} />
}

export const MenuIcon = props => (<FontAwesomeIcon icon={faBars} {...props} />)
export const EditIcon = props => (<FontAwesomeIcon icon={faEdit} {...props} />)
export const ExecIcon = props => (<FontAwesomeIcon icon={faPlay} {...props} />)
export const CloseIcon = props => (<FontAwesomeIcon icon={faTimes} {...props} />)
export const SaveIcon = props => (<FontAwesomeIcon icon={faSave} {...props} />)