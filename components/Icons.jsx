import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faPlay, faEdit, faExternalLinkAlt, faTimes, faSave, faAnchor, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons'
import styled from 'styled-components'

const IconWrapper = styled.span`
    svg {
        width: 0.7rem;
        height: 0.7rem;
    }
`

export const Icon = (props) => <IconWrapper><FontAwesomeIcon icon={props.icon} /></IconWrapper>

export const MenuIcon = props => <Icon icon={faBars} />
export const EditIcon = props => <Icon icon={faEdit} />
export const ExecIcon = props => <Icon icon={faPlay} />
export const CloseIcon = props => <Icon icon={faTimes} />
export const SaveIcon = props => <Icon icon={faSave} />
export const TrashIcon = props => <Icon icon={faTrash} />

export const CancelUndoIcon = props => <Icon icon={faUndo} />
export const ExternalLinkIcon = props => <Icon icon={faExternalLinkAlt}/>
export const AnchorIcon = props => <Icon icon={faAnchor}/>
