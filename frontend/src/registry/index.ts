import React from 'react';
import { RegistryComponentProps } from './types';
import { ButtonElement } from './elements/ButtonElement';
import { InputElement } from './elements/InputElement';
import { HeadingElement } from './elements/HeadingElement';
import { TextElement } from './elements/TextElement';
import { ContainerElement } from './elements/ContainerElement';
import { CardElement } from './elements/CardElement';
import { NavbarElement } from './elements/NavbarElement';
import { TableElement } from './elements/TableElement';
import { BadgeElement } from './elements/BadgeElement';
import { AvatarElement } from './elements/AvatarElement';
import { CheckboxElement } from './elements/CheckboxElement';
import { ImagePlaceholderElement } from './elements/ImagePlaceholderElement';
import { DividerElement } from './elements/DividerElement';
import { FallbackElement } from './elements/FallbackElement';

export const APPROVED_COMPONENT_TYPES = [
  'Container',
  'Navbar',
  'Card',
  'Button',
  'Input',
  'Heading',
  'Text',
  'Table',
  'Badge',
  'Avatar',
  'Checkbox',
  'ImagePlaceholder',
  'Divider',
] as const;

export const ComponentRegistry: Record<string, React.FC<RegistryComponentProps>> = {
  Button: ButtonElement,
  Input: InputElement,
  Heading: HeadingElement,
  Text: TextElement,
  Container: ContainerElement,
  Card: CardElement,
  Navbar: NavbarElement,
  Table: TableElement,
  Badge: BadgeElement,
  Avatar: AvatarElement,
  Checkbox: CheckboxElement,
  ImagePlaceholder: ImagePlaceholderElement,
  Divider: DividerElement,
};

/** Normalizes type strings and handles approved synonyms gracefully */
export function getRegistryComponent(type: string): React.FC<RegistryComponentProps> {
  if (!type) return FallbackElement;

  if (ComponentRegistry[type]) {
    return ComponentRegistry[type];
  }

  // Synonym and case-insensitive resolution
  const cleanType = type.trim().toLowerCase();
  switch (cleanType) {
    case 'textinput':
    case 'text input':
      return InputElement;
    case 'navigation':
    case 'navigationbar':
    case 'navigation bar':
      return NavbarElement;
    case 'image':
    case 'image placeholder':
      return ImagePlaceholderElement;
    case 'header':
      return HeadingElement;
    case 'separator':
      return DividerElement;
    default:
      // Case-insensitive match on registry keys
      const matchedKey = Object.keys(ComponentRegistry).find(
        (key) => key.toLowerCase() === cleanType
      );
      return matchedKey ? ComponentRegistry[matchedKey] : FallbackElement;
  }
}

export * from './types';

