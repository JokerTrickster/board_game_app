import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  View,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ImageBackground,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { HomeViewModel } from '../viewModels/HomeViewModel';
import { GameItem, QuickAction, AppNotification } from '../models/HomeModel';
import Header from '../../../components/Header';
import GameCard from '../../../components/GameCard';
import styles from '../../../styles/ReactHomeStyles';

interface HomeViewProps {
  viewModel: HomeViewModel;
  onGamePress: (gameId: number) => void;
  onQuickActionPress: (actionId: string) => void;
  onNotificationPress: (notificationId: string) => void;
  onCategoryPress: (category: string) => void;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onUserProfilePress: () => void;
}

export const HomeView: React.FC<HomeViewProps> = observer(({
  viewModel,
  onGamePress,
  onQuickActionPress,
  onNotificationPress,
  onCategoryPress,
  onSearchChange,
  onRefresh,
  onUserProfilePress
}) => {
  const renderUserHeader = () => (
    <TouchableOpacity 
      style={styles.userHeaderContainer}
      onPress={onUserProfilePress}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>안녕하세요, {viewModel.userName}님!</Text>
        <View style={styles.userStats}>
          <Text style={styles.userLevel}>Level {viewModel.userLevel}</Text>
          <Text style={styles.userExperience}>EXP: {viewModel.userExperience}</Text>
        </View>
      </View>
      {viewModel.unreadNotificationCount > 0 && (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>
            {viewModel.unreadNotificationCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Icon name="search" size={16} color="#999" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="게임을 검색해보세요..."
        value={viewModel.searchQuery}
        onChangeText={onSearchChange}
        placeholderTextColor="#999"
      />
      {viewModel.searchQuery.length > 0 && (
        <TouchableOpacity 
          onPress={() => onSearchChange('')}
          style={styles.clearSearchButton}
        >
          <Icon name="times" size={16} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>빠른 실행</Text>
      <View style={styles.quickActionsList}>
        {viewModel.quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionItem}
            onPress={() => onQuickActionPress(action.id)}
          >
            <View style={styles.quickActionIconContainer}>
              <Icon name={action.icon} size={24} color="#667eea" />
              {action.badge && (
                <View style={styles.quickActionBadge}>
                  <Text style={styles.quickActionBadgeText}>{action.badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.quickActionTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{viewModel.homeStats.totalUsers.toLocaleString()}</Text>
        <Text style={styles.statLabel}>총 사용자</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{viewModel.homeStats.activeGames}</Text>
        <Text style={styles.statLabel}>게임 수</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{viewModel.homeStats.todayGames}</Text>
        <Text style={styles.statLabel}>오늘 플레이</Text>
      </View>
      {viewModel.homeStats.weeklyRanking && (
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>#{viewModel.homeStats.weeklyRanking}</Text>
          <Text style={styles.statLabel}>주간 랭킹</Text>
        </View>
      )}
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
      >
        {viewModel.availableCategories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryItem,
              viewModel.selectedGameCategory === category && styles.categoryItemSelected
            ]}
            onPress={() => onCategoryPress(category)}
          >
            <Text style={[
              styles.categoryText,
              viewModel.selectedGameCategory === category && styles.categoryTextSelected
            ]}>
              {getCategoryDisplayName(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFeaturedGames = () => {
    if (viewModel.featuredGames.length === 0) return null;

    return (
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>추천 게임</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.featuredScroll}
        >
          {viewModel.featuredGames.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.featuredGameItem}
              onPress={() => onGamePress(game.id)}
            >
              <View style={styles.featuredGameImage}>
                <Text style={styles.featuredGameImageText}>{game.name[0]}</Text>
              </View>
              <Text style={styles.featuredGameName}>{game.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderRecentlyPlayed = () => {
    if (viewModel.recentlyPlayedGames.length === 0) return null;

    return (
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>최근 플레이</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.recentScroll}
        >
          {viewModel.recentlyPlayedGames.map((game) => (
            <TouchableOpacity
              key={`recent-${game.id}`}
              style={styles.recentGameItem}
              onPress={() => onGamePress(game.id)}
            >
              <View style={styles.recentGameImage}>
                <Text style={styles.recentGameImageText}>{game.name[0]}</Text>
              </View>
              <Text style={styles.recentGameName}>{game.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderGameList = () => (
    <View style={styles.gameListSection}>
      <Text style={styles.sectionTitle}>
        {viewModel.searchQuery ? `검색 결과 (${viewModel.gameList.length})` : '모든 게임'}
      </Text>
      
      {viewModel.gameList.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="gamepad" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>
            {viewModel.searchQuery ? '검색 결과가 없습니다' : '게임을 불러오는 중...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={viewModel.gameList}
          keyExtractor={(item) => `game-${item.id}`}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GameCard
              game={item}
              onPress={() => onGamePress(item.id)}
              style={styles.gameCardItem}
            />
          )}
          contentContainerStyle={styles.gameListContent}
        />
      )}
    </View>
  );

  const renderNotifications = () => {
    if (viewModel.notifications.length === 0) return null;

    return (
      <View style={styles.notificationsSection}>
        <Text style={styles.sectionTitle}>알림</Text>
        {viewModel.notifications.slice(0, 3).map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              !notification.isRead && styles.notificationItemUnread
            ]}
            onPress={() => onNotificationPress(notification.id)}
          >
            <View style={[
              styles.notificationIcon,
              { backgroundColor: getNotificationColor(notification.type) }
            ]}>
              <Icon 
                name={getNotificationIcon(notification.type)} 
                size={16} 
                color="white" 
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {notification.message}
              </Text>
              <Text style={styles.notificationTime}>
                {formatNotificationTime(notification.timestamp)}
              </Text>
            </View>
            {!notification.isRead && (
              <View style={styles.notificationUnreadDot} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderOfflineMessage = () => {
    if (viewModel.isOnline) return null;

    return (
      <View style={styles.offlineMessage}>
        <Icon name="wifi" size={16} color="#F44336" />
        <Text style={styles.offlineMessageText}>오프라인 모드</Text>
      </View>
    );
  };

  const renderMaintenanceMessage = () => {
    if (!viewModel.isMaintenanceMode) return null;

    return (
      <View style={styles.maintenanceMessage}>
        <Icon name="wrench" size={16} color="#FF9800" />
        <Text style={styles.maintenanceMessageText}>점검 중</Text>
      </View>
    );
  };

  const renderErrorMessage = () => {
    if (!viewModel.error) return null;

    return (
      <View style={styles.errorMessage}>
        <Text style={styles.errorMessageText}>{viewModel.error}</Text>
        <TouchableOpacity 
          onPress={viewModel.clearError}
          style={styles.errorDismissButton}
        >
          <Icon name="times" size={16} color="#F44336" />
        </TouchableOpacity>
      </View>
    );
  };

  if (viewModel.isLoading && !viewModel.isProfileLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="spinner" size={32} color="#667eea" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../../../assets/images/background.png')} 
      style={styles.background}
    >
      <Header />
      
      {renderOfflineMessage()}
      {renderMaintenanceMessage()}
      {renderErrorMessage()}
      
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={viewModel.isRefreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
      >
        {renderUserHeader()}
        {renderSearchBar()}
        {renderQuickActions()}
        {renderStats()}
        {renderNotifications()}
        {renderFeaturedGames()}
        {renderRecentlyPlayed()}
        {renderCategories()}
        {renderGameList()}
        
        <View style={styles.footerSpacer} />
      </ScrollView>
    </ImageBackground>
  );
});

// Helper functions
function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    'all': '전체',
    'favorites': '즐겨찾기',
    'recent': '최근 플레이',
    'puzzle': '퍼즐',
    'strategy': '전략',
    'action': '액션',
    'card': '카드',
    'board': '보드게임'
  };
  
  return categoryNames[category] || category;
}

function getNotificationColor(type: string): string {
  const colors: Record<string, string> = {
    'info': '#2196F3',
    'success': '#4CAF50',
    'warning': '#FF9800',
    'error': '#F44336'
  };
  
  return colors[type] || '#2196F3';
}

function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    'info': 'info-circle',
    'success': 'check-circle',
    'warning': 'exclamation-triangle',
    'error': 'exclamation-circle'
  };
  
  return icons[type] || 'bell';
}

function formatNotificationTime(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return timestamp.toLocaleDateString();
}

export default HomeView;