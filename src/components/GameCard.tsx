import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './styles/GameCardStyles';

type GameCardProps = {
    title: string;
    hashtag: string;
    category: string;
    image: string;
    onPress: () => void;
};

const GameCard: React.FC<GameCardProps> = ({ title, category, hashtag, image, onPress }) => {
    const cardImage =
        title === '틀린그림찾기'
            ? require('../assets/images/common/find-it.png')
            : title === '슬라임전쟁'
                ? require('../assets/images/common/slime-war.png')
                : title === '시퀀스'
                    ? require('../assets/images/common/sequence.png')
                    : require('../assets/images/common/default.png');
    
    return (
        <TouchableOpacity style={styles.gameCard} onPress={onPress}>
            <View style={styles.imageWrapper}>
                <Image source={cardImage} style={styles.gameImage} />
                {/* default.png일 때 오버레이 텍스트 표시 - 시퀀스 게임 추가 */}
                {title !== '틀린그림찾기' && title !== '슬라임전쟁' && title !== '시퀀스' && (
                    <View style={styles.overlay}>
                        <Text style={styles.overlayText}>출시 준비 중</Text>
                    </View>
                )}
            </View>
            <Text style={styles.gameTitle}>{title}</Text>
            <View style={styles.hashtagContainer}>
                <View style={styles.categoryBorder}>
                    <Text style={styles.categoryText}>{category}</Text>
                </View>
                <View style={styles.hashtagBorder}>
                    <Text style={styles.hashtagText}>#{hashtag}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default GameCard;
