import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { Block, BlockType } from '../../types';
import { Icon } from '../common';

interface BlockEditorProps {
  initialBlocks?: Block[];
  onChange?: (blocks: Block[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  initialBlocks = [],
  onChange,
  placeholder = 'Type \'/\' for commands...',
  autoFocus = false,
}) => {
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks.length > 0
      ? initialBlocks
      : [{ id: uuidv4(), type: 'paragraph', content: '' }]
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    blocks[0]?.id || null
  );
  const inputRefs = useRef<Record<string, TextInput | null>>({});

  const updateBlock = useCallback(
    (blockId: string, content: string) => {
      const newBlocks = blocks.map((block) =>
        block.id === blockId ? { ...block, content } : block
      );
      setBlocks(newBlocks);
      onChange?.(newBlocks);
    },
    [blocks, onChange]
  );

  const changeBlockType = useCallback(
    (blockId: string, type: BlockType) => {
      const newBlocks = blocks.map((block) =>
        block.id === blockId ? { ...block, type } : block
      );
      setBlocks(newBlocks);
      onChange?.(newBlocks);
    },
    [blocks, onChange]
  );

  const addBlock = useCallback(
    (afterBlockId: string, type: BlockType = 'paragraph') => {
      const newBlock: Block = { id: uuidv4(), type, content: '' };
      const index = blocks.findIndex((b) => b.id === afterBlockId);
      const newBlocks = [
        ...blocks.slice(0, index + 1),
        newBlock,
        ...blocks.slice(index + 1),
      ];
      setBlocks(newBlocks);
      setSelectedBlockId(newBlock.id);
      onChange?.(newBlocks);
    },
    [blocks, onChange]
  );

  const deleteBlock = useCallback(
    (blockId: string) => {
      if (blocks.length <= 1) {
        updateBlock(blockId, '');
        return;
      }
      const index = blocks.findIndex((b) => b.id === blockId);
      const newBlocks = blocks.filter((b) => b.id !== blockId);
      setBlocks(newBlocks);
      setSelectedBlockId(newBlocks[Math.max(0, index - 1)]?.id || null);
      onChange?.(newBlocks);
    },
    [blocks, updateBlock, onChange]
  );

  const handleKeyPress = useCallback(
    (blockId: string, key: string) => {
      if (key === 'Enter') {
        addBlock(blockId);
      } else if (key === 'Backspace' && blocks.find((b) => b.id === blockId)?.content === '') {
        deleteBlock(blockId);
      }
    },
    [addBlock, deleteBlock, blocks]
  );

  const getBlockStyle = (type: BlockType) => {
    switch (type) {
      case 'heading1':
        return styles.heading1;
      case 'heading2':
        return styles.heading2;
      case 'heading3':
        return styles.heading3;
      case 'bulletedList':
        return styles.list;
      case 'numberedList':
        return styles.list;
      case 'quote':
        return styles.quote;
      case 'callout':
        return styles.callout;
      case 'code':
        return styles.code;
      default:
        return styles.paragraph;
    }
  };

  const renderBlockPrefix = (type: BlockType, blockId: string) => {
    switch (type) {
      case 'bulletedList':
        return <Text style={styles.bulletPrefix}>\u2022</Text>;
      case 'numberedList':
        const index = blocks.findIndex((b) => b.id === blockId);
        return <Text style={styles.numberPrefix}>{index + 1}.</Text>;
      case 'toggle':
        return (
          <TouchableOpacity onPress={() => {}}>
            <Icon name="chevronRight" size={14} color={Colors.text.muted} />
          </TouchableOpacity>
        );
      case 'callout':
        return <Icon name="info" size={18} color={Colors.accent.primary} />;
      default:
        return null;
    }
  };

  const renderBlockContent = (block: Block) => {
    const isSelected = selectedBlockId === block.id;

    if (block.type === 'image') {
      return (
        <View style={styles.imageBlock}>
          <Icon name="image" size={48} color={Colors.text.muted} />
          <Text style={styles.imagePlaceholder}>Add image URL</Text>
        </View>
      );
    }

    if (block.type === 'code') {
      return (
        <TextInput
          ref={(el) => { inputRefs.current[block.id] = el; }}
          style={[styles.codeInput, getBlockStyle(block.type)]}
          value={block.content}
          onChangeText={(content) => updateBlock(block.id, content)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(block.id, nativeEvent.key)}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.muted}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
        />
      );
    }

    return (
      <View style={styles.blockContainer}>
        {renderBlockPrefix(block.type, block.id)}
        <TextInput
          ref={(el) => { inputRefs.current[block.id] = el; }}
          style={[styles.input, getBlockStyle(block.type), isSelected && styles.selected]}
          value={block.content}
          onChangeText={(content) => updateBlock(block.id, content)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(block.id, nativeEvent.key)}
          onFocus={() => setSelectedBlockId(block.id)}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.muted}
          multiline={block.type !== 'callout'}
        />
        <TouchableOpacity
          style={styles.blockMenu}
          onPress={() => {}}
        >
          <Icon name="drag" size={16} color={Colors.text.muted} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {blocks.map((block) => (
          <View key={block.id} style={styles.blockWrapper}>
            {renderBlockContent(block)}
          </View>
        ))}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addBlock(blocks[blocks.length - 1]?.id || '')}
        >
          <Icon name="plus" size={16} color={Colors.text.muted} />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
    padding: Spacing.md,
  },
  blockWrapper: {
    marginBottom: Spacing.sm,
  },
  blockContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    fontSize: FontSizes.body,
    color: Colors.text.primary,
    padding: Spacing.xs,
    minHeight: 24,
  },
  selected: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.sm,
  },
  paragraph: {
    fontSize: FontSizes.body,
  },
  heading1: {
    fontSize: FontSizes.h1,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  heading2: {
    fontSize: FontSizes.h2,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  heading3: {
    fontSize: FontSizes.h3,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  list: {
    fontSize: FontSizes.body,
  },
  bulletPrefix: {
    width: 20,
    color: Colors.text.muted,
    fontSize: FontSizes.body,
  },
  numberPrefix: {
    width: 24,
    color: Colors.text.muted,
    fontSize: FontSizes.body,
  },
  quote: {
    fontSize: FontSizes.body,
    fontStyle: 'italic',
    color: Colors.text.secondary,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent.primary,
    paddingLeft: Spacing.md,
  },
  callout: {
    flexDirection: 'row',
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: FontSizes.caption,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.accent.tertiary,
  },
  codeInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: FontSizes.caption,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.accent.tertiary,
    minHeight: 100,
  },
  blockMenu: {
    padding: Spacing.xs,
    opacity: 0.5,
  },
  imageBlock: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  imagePlaceholder: {
    color: Colors.text.muted,
    fontSize: FontSizes.caption,
  },
  addButton: {
    padding: Spacing.md,
    alignItems: 'center',
    opacity: 0.5,
  },
});
