import React from 'react';
import { TouchableOpacity, ImageBackground, Text, StyleProp, ViewStyle, ImageStyle, TextStyle } from 'react-native';
import buttonStyles from './styles/ButtonStyles';

interface ButtonProps {
    onPress: () => void;
    disabled?: boolean;
    containerStyle?: any;
    text: string;
    textStyle?: any;
}

const Button: React.FC<ButtonProps> = ({
    onPress,
    disabled = false,
    containerStyle,
    text,
    textStyle,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[buttonStyles.buttonContainer, containerStyle, disabled && buttonStyles.disabled]}
            activeOpacity={0.7}
        >
                <Text style={[buttonStyles.text, textStyle]}>
                    {text}
                </Text>
        </TouchableOpacity>
    );
};
export default Button;
