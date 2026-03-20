import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { FontSizes } from '../../constants/theme';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

const ICONS: Record<string, string> = {
  home: '\u2302',
  homeOutline: '\u2302',
  search: '\u26B2',
  searchOutline: '\u26B2',
  plus: '+',
  plusCircle: '\u2295',
  minus: '\u2212',
  check: '\u2713',
  checkCircle: '\u2299',
  x: '\u2715',
  xCircle: '\u2297',
  chevronRight: '\u203A',
  chevronLeft: '\u2039',
  chevronDown: '\u203A',
  chevronUp: '\u2039',
  menu: '\u2630',
  settings: '\u2699',
  settingsOutline: '\u2699',
  person: '\u263A',
  personOutline: '\u263A',
  calendar: '\u23F0',
  calendarOutline: '\u23F0',
  task: '\u2611',
  taskOutline: '\u2611',
  database: '\u25A6',
  databaseOutline: '\u25A6',
  note: '\u270E',
  noteOutline: '\u270E',
  link: '\u26D3',
  linkOutline: '\u26D3',
  image: '\u2B06',
  imageOutline: '\u2B06',
  code: '\u2328',
  codeOutline: '\u2328',
  folder: '\u29B8',
  folderOutline: '\u29B8',
  star: '\u2605',
  starOutline: '\u2606',
  flag: '\u2691',
  flagOutline: '\u2690',
  clock: '\u23F1',
  clockOutline: '\u23F1',
  bell: '\u2762',
  bellOutline: '\u2762',
  trash: '\u2421',
  trashOutline: '\u2421',
  edit: '\u270E',
  editOutline: '\u270E',
  copy: '\u2398',
  copyOutline: '\u2398',
  share: '\u21A6',
  shareOutline: '\u21A6',
  lock: '\u26BF',
  lockOutline: '\u26BF',
  unlock: '\u26BE',
  unlockOutline: '\u26BE',
  brain: '\u1F9E0',
  bot: '\u1F916',
  botOutline: '\u1F916',
  sparkles: '\u2728',
  sparklesOutline: '\u2728',
  text: '\u2122',
  textOutline: '\u2122',
  table: '\u2630',
  tableOutline: '\u2630',
  kanban: '\u25A0',
  kanbanOutline: '\u25A0',
  list: '\u2630',
  listOutline: '\u2630',
  gallery: '\u25A3',
  galleryOutline: '\u25A3',
  wiki: '\u2B21',
  wikiOutline: '\u2B21',
  google: 'G',
  apple: '\u00A9',
  microsoft: '\u00AE',
  ticktick: '\u2713',
  todoist: 'T',
  drag: '\u2630',
  more: '\u22EE',
  paperclip: '\u1F4CE',
  bold: 'B',
  italic: 'I',
  underline: 'U',
  strikethrough: 'S',
  heading: 'H',
  quote: '\u201C',
  codeInline: '< >',
  formula: 'fx',
  callout: '\u2753',
  bullet: '\u2022',
  numbered: '1.',
  toggle: '\u25BC',
  divider: '\u2500',
  embed: '\u2B0C',
  arrowRight: '\u2192',
  arrowLeft: '\u2190',
  arrowUp: '\u2191',
  arrowDown: '\u2193',
  cross: '\u2717',
  info: '\u24D8',
  warning: '\u26A0',
  error: '\u26D4',
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = FontSizes.body,
  color = '#FFFFFF',
  style,
}) => {
  const iconChar = ICONS[name] || ICONS[name.replace('Outline', '')] || '\u25CF';

  return (
    <Text style={[styles.icon, { fontSize: size, color }, style]}>
      {name.endsWith('Outline') && ICONS[name] ? ICONS[name] : iconChar}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});
