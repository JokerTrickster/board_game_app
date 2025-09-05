import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Alert, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Slider from '@react-native-community/slider';
import styles from './styles/MultiHeaderStyles';
import { gameService } from '../services/GameService';
import { useNavigationActions } from '../hooks/useNavigationActions';

export interface GameHeaderConfig {
  // Header type determines layout and features
  type: 'home' | 'solo' | 'multi' | 'game-solo' | 'game-multi';
  
  // User data
  userData?: any;
  users?: any[];
  
  // Timer (for multi-player games)
  timer?: number;
  maxTime?: number;
  
  // Game-specific data
  gameType?: 'find-it' | 'frog' | 'sequence' | 'slime-war';
  isMyTurn?: boolean;
  myLastCard?: any;
  opponentLastCard?: any;
  
  // Visual customization
  showSettings?: boolean;
  showCoin?: boolean;
  showTimer?: boolean;
  showLastCards?: boolean;
  
  // Card rendering functions (for games with different card systems)
  getCardImageSource?: (cardId: any) => any;
  
  // Navigation config
  enableBackHandler?: boolean;
  showExitConfirmation?: boolean;
}

const GameHeader: React.FC<GameHeaderConfig> = ({
  type = 'home',
  userData,
  users,
  timer = 30,
  maxTime = 30,
  gameType,
  isMyTurn = false,
  myLastCard,
  opponentLastCard,
  showSettings = true,
  showCoin = false,
  showTimer = false,
  showLastCards = false,
  getCardImageSource,
  enableBackHandler = false,
  showExitConfirmation = false,
}) => {
  const [user, setUser] = useState(userData?.user);
  const [profileImage, setProfileImage] = useState(userData?.profileImage);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEffectSoundOn, setIsEffectSoundOn] = useState(true);
  const [isBgmOn, setIsBgmOn] = useState(true);
  const [effectVolume, setEffectVolume] = useState(0.5);
  const [bgmVolume, setBgmVolume] = useState(0.5);

  const { logout, deleteAccount } = useNavigationActions({
    enableBackHandler,
    showExitConfirmation,
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      const storedData = await gameService.getUserInfo();
      if (storedData) {
        setUser(storedData.user);
        setProfileImage(storedData.profileImage);
      }
    };

    if (!user) {
      fetchUserInfo();
    }
  }, [userData, user]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Handle sound toggles
  const handleEffectSoundToggle = (value: boolean) => {
    setIsEffectSoundOn(value);
    setEffectVolume(value ? 0.5 : 0);
  };

  const handleBgmToggle = (value: boolean) => {
    setIsBgmOn(value);
    setBgmVolume(value ? 0.5 : 0);
  };

  // Render different header layouts based on type
  const renderHomeHeader = () => {
    // Import the home styles for proper coin layout
    const homeStyles = require('./styles/HomeHeaderStyles').default;
    
    return (
      <View style={homeStyles.header}>
        {/* Profile with ImageBackground */}
        <View style={homeStyles.profileContainer}>
          <Image
            source={require('../assets/icons/home/profile.png')}
            style={homeStyles.profileBorder}
            resizeMode="contain"
          />
          <View style={homeStyles.profileInfo}>
            <Text style={homeStyles.nickname}>{user?.name || '보린이'}</Text>
            <Text style={homeStyles.title}>초보자</Text>
          </View>
        </View>

        {/* Coin (if enabled) */}
        {showCoin && (
          <View style={homeStyles.coin}>
            <Image
              source={require('../assets/icons/home/coin.png')}
              style={homeStyles.coinIcon}
            />
            <Text style={homeStyles.coinCount} numberOfLines={1}>
              {user?.coin?.toLocaleString() ?? '10000'}
            </Text>
          </View>
        )}

        {/* Settings */}
        {showSettings && (
          <TouchableOpacity style={homeStyles.settingsIcon} onPress={toggleModal}>
            <Icon name="bars" size={26} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSoloHeader = () => (
    <View style={styles.multiHeader}>
      {/* Single profile */}
      <View style={styles.profileContainer}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require('../assets/images/home/default_profile.png')
          }
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.nickname}>{user?.name || '보린이'}</Text>
        </View>
      </View>

      {/* Center content */}
      <View style={styles.centerContainer}>
        <Text style={styles.roundText}>솔로 플레이</Text>
      </View>

      {/* Settings */}
      {showSettings && (
        <TouchableOpacity style={styles.settingsIcon} onPress={toggleModal}>
          <Icon name="bars" size={26} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMultiHeader = () => {
    // Get user profiles for multiplayer
    const userList = users || [user];
    const profile1 = userList[0] || { name: '유저1', profileImage: null };
    const profile2 = userList[1] || { name: '유저2', profileImage: null };

    return (
      <View style={styles.multiHeader}>
        {/* Profile 1 */}
        <View style={styles.profileContainer}>
          <Image
            source={
              profile1.profileImage
                ? { uri: profile1.profileImage }
                : require('../assets/images/home/default_profile.png')
            }
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={[
              styles.nickname,
              isMyTurn && profile1.name === '나' && styles.activePlayerName,
              !isMyTurn && profile2.name === '상대' && styles.activePlayerName
            ]}>
              {profile1.name || '보린이'}
            </Text>
          </View>
          {/* Last card for player 1 */}
          {showLastCards && myLastCard && getCardImageSource && (
            <View style={styles.lastCardContainer}>
              <Image
                source={getCardImageSource(myLastCard)}
                style={styles.lastCardImage}
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        {/* Center: Timer or Round info */}
        <View style={styles.centerContainer}>
          {showTimer ? (
            <View style={styles.timerWrapper}>
              <View style={styles.timerContainer}>
                <View style={styles.timerBar}>
                  <View
                    style={[
                      styles.timerProgress,
                      { width: `${(timer / maxTime) * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.timerText}>{timer}초</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.roundText}>멀티 플레이</Text>
          )}
        </View>

        {/* Profile 2 */}
        <View style={styles.profileContainer}>
          <Image
            source={
              profile2.profileImage
                ? { uri: profile2.profileImage }
                : require('../assets/images/home/default_profile.png')
            }
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={[
              styles.nickname,
              isMyTurn && profile2.name === '상대' && styles.activePlayerName,
              !isMyTurn && profile1.name === '나' && styles.activePlayerName
            ]}>
              {profile2.name || '보린이'}
            </Text>
          </View>
          {/* Last card for player 2 */}
          {showLastCards && opponentLastCard && getCardImageSource && (
            <View style={styles.lastCardContainer}>
              <Image
                source={getCardImageSource(opponentLastCard)}
                style={styles.lastCardImage}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  // Settings modal content
  const renderSettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={toggleModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>설정</Text>

          {/* Effect Sound Toggle */}
          <View style={styles.settingItem}>
            <Text>효과음</Text>
            <Switch
              value={isEffectSoundOn}
              onValueChange={handleEffectSoundToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isEffectSoundOn ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          {/* Effect Volume Slider */}
          {isEffectSoundOn && (
            <View style={styles.settingItem}>
              <Text>효과음 볼륨</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={effectVolume}
                onValueChange={setEffectVolume}
                minimumTrackTintColor="#1fb28a"
                maximumTrackTintColor="#d3d3d3"
                thumbStyle={{ backgroundColor: '#1fb28a' }}
              />
            </View>
          )}

          {/* BGM Toggle */}
          <View style={styles.settingItem}>
            <Text>배경음</Text>
            <Switch
              value={isBgmOn}
              onValueChange={handleBgmToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isBgmOn ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          {/* BGM Volume Slider */}
          {isBgmOn && (
            <View style={styles.settingItem}>
              <Text>배경음 볼륨</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={bgmVolume}
                onValueChange={setBgmVolume}
                minimumTrackTintColor="#1fb28a"
                maximumTrackTintColor="#d3d3d3"
                thumbStyle={{ backgroundColor: '#1fb28a' }}
              />
            </View>
          )}

          {/* Action Buttons */}
          <TouchableOpacity style={styles.modalButton} onPress={logout}>
            <Text>🚪 로그아웃</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalButton} onPress={deleteAccount}>
            <Text>🚨 회원 탈퇴</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
            <Text>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Render appropriate header based on type
  let headerContent;
  switch (type) {
    case 'home':
      headerContent = renderHomeHeader();
      break;
    case 'solo':
    case 'game-solo':
      headerContent = renderSoloHeader();
      break;
    case 'multi':
    case 'game-multi':
      headerContent = renderMultiHeader();
      break;
    default:
      headerContent = renderHomeHeader();
  }

  return (
    <>
      {headerContent}
      {showSettings && renderSettingsModal()}
    </>
  );
};

export default GameHeader;