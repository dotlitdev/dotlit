import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faPlay, faEdit, faExternalLinkAlt, faTimes, faSave, faAnchor, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons'


export const Icon = (props) => <FontAwesomeIcon icon={props.icon} />

export const MenuIcon = props => (<FontAwesomeIcon icon={faBars} {...props} />)
export const EditIcon = props => (<FontAwesomeIcon icon={faEdit} {...props} />)
export const ExecIcon = props => (<FontAwesomeIcon icon={faPlay} {...props} />)
export const CloseIcon = props => (<FontAwesomeIcon icon={faTimes} {...props} />)
export const SaveIcon = props => (<FontAwesomeIcon icon={faSave} {...props} />)
export const TrashIcon = props => (<FontAwesomeIcon icon={faTrash} {...props} />)
export const CancelUndoIcon = props => <Icon icon={faUndo} />
export const ExternalLinkIcon = props => <Icon icon={faExternalLinkAlt}/>
export const AnchorIcon = props => <Icon icon={faAnchor}/>
