import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, FontSizes } from '../../constants/theme';
import { Icon } from '../../components/common';
import { useStore } from '../../store/workspace';
import type { Page } from '../../types';

interface PagesScreenProps {
  navigation: any;
}

export const PagesScreen: React.FC<PagesScreenProps> = ({ navigation }) => {
  const { pages, addPage } = useStore();

  const handleNewPage = () => {
    const page = addPage({
      title: 'Untitled',
      content: [],
    });
    navigation.navigate('PageDetail', { pageId: page.id });
  };

  const renderPage = ({ item }: { item: Page }) => (
    <TouchableOpacity
      style={styles.pageItem}
      onPress={() => navigation.navigate('PageDetail', { pageId: item.id })}
    >
      <View style={styles.pageIcon}>
        <Icon name="note" size={20} color={Colors.accent.primary} />
      </View>
      <View style={styles.pageInfo}>
        <Text style={styles.pageTitle}>{item.title || 'Untitled'}</Text>
        <Text style={styles.pageMeta}>
          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Just now'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.pageMenu}
        onPress={() => {}}
      >
        <Icon name="more" size={18} color={Colors.text.muted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pages</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleNewPage}>
          <Icon name="plus" size={20} color={Colors.accent.primary} />
        </TouchableOpacity>
      </View>

      {pages.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="note" size={48} color={Colors.text.muted} />
          <Text style={styles.emptyText}>No pages yet</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleNewPage}>
            <Text style={styles.emptyButtonText}>Create your first page</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pages}
          renderItem={renderPage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.h2,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  list: {
    padding: Spacing.md,
  },
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pageIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  pageTitle: {
    fontSize: FontSizes.body,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  pageMeta: {
    fontSize: FontSizes.small,
    color: Colors.text.muted,
    marginTop: 2,
  },
  pageMenu: {
    padding: Spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSizes.body,
    color: Colors.text.muted,
    marginTop: Spacing.md,
  },
  emptyButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.accent.primary,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.background.primary,
  },
});
