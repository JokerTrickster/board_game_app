import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from '../styles/HomeStyles';

type GameCardProps = {
    title: string;
    hashtag: string;
    category: string;
    image: string;
    onPress: () => void;
};

const GameCard: React.FC<GameCardProps> = ({ title, category,hashtag, image, onPress }) => {
    return (
        <TouchableOpacity style={styles.gameCard} onPress={onPress}>
            <Image source={{ uri: image }} style={styles.gameImage} />
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
