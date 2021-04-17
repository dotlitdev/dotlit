import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Icons from '@fortawesome/free-solid-svg-icons'

const { faBars, faPlay, faEdit, faTimes, faSave } = Icons

export const Icon = (props) => {
  if (props.name && Icons[props.name])
    return <FontAwesomeIcon icon={Icons[props.name]} />
  else return null
}

export const MenuIcon = props => (<FontAwesomeIcon icon={faBars} {...props} />)
export const EditIcon = props => (<FontAwesomeIcon icon={faEdit} {...props} />)
export const ExecIcon = props => (<FontAwesomeIcon icon={faPlay} {...props} />)
export const CloseIcon = props => (<FontAwesomeIcon icon={faTimes} {...props} />)
export const SaveIcon = props => (<FontAwesomeIcon icon={faSave} {...props} />)
