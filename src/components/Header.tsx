import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from '../styles/HomeStyles';
import Icon from 'react-native-vector-icons/FontAwesome';

const Header = () => {
    return (
        <View style={styles.header}>
            <View style={styles.profile}>
                <Image source={require('../assets/images/kahuna.png')} style={styles.profileImage} />
                <View style={styles.profileInfo}>
                    <Text style={styles.nickname}>나는야말랑이</Text>
                    <Text style={styles.level}>Lv. 2</Text>
                </View>
            </View>

            <View style={styles.hearts}>
                <Icon name="heart" size={24} color="red" />
                <Text style={styles.heartCount}>28/30</Text>
            </View>

            <TouchableOpacity style={styles.settingsIcon}>
                <Icon name="bars" size={24} />
            </TouchableOpacity>
        </View>
    );
};

export default Header;
