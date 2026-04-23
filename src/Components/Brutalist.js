import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HappyHuesTheme } from '../Constants/Theme';

export const BrutalistButton = ({ label, onPress, type = 'primary' }) => {
    const bgColor = type === 'primary' ? HappyHuesTheme.button : HappyHuesTheme.secondary;

    return (
        <View style={styles.buttonShadow}>
            <TouchableOpacity 
                onPress={onPress}
                activeOpacity={0.9}
                style={[styles.buttonBase, { backgroundColor: bgColor }]}
            >
                <Text style={styles.buttonText}>{label}</Text>
            </TouchableOpacity>
        </View>
    );
};

export const BrutalistCard = ({ children, title }) => (
    <View style={styles.cardShadow}>
        <View style={styles.cardBase}>
            {title && (
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{title}</Text>
                </View>
            )}
            {children}
        </View>
    </View>
);

const styles = StyleSheet.create({
    buttonShadow: {
        backgroundColor: HappyHuesTheme.stroke,
        borderRadius: 0,
        marginBottom: 10,
    },
    buttonBase: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderWidth: 3,
        borderColor: HappyHuesTheme.stroke,
        alignItems: 'center',
        justifyContent: 'center',
        // Efek offset manual (pengganti translate di web)
        bottom: 4,
        right: 4,
    },
    buttonText: {
        color: HappyHuesTheme.buttonText,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cardShadow: {
        backgroundColor: HappyHuesTheme.stroke,
        marginBottom: 20,
        marginRight: 8,
    },
    cardBase: {
        backgroundColor: HappyHuesTheme.main,
        borderWidth: 3,
        borderColor: HappyHuesTheme.stroke,
        padding: 20,
        bottom: 6,
        right: 6,
    },
    cardHeader: {
        borderBottomWidth: 3,
        borderBottomColor: HappyHuesTheme.stroke,
        paddingBottom: 10,
        marginBottom: 15,
    },
    cardTitle: {
        fontWeight: '900',
        fontSize: 18,
        color: HappyHuesTheme.tertiary,
        textTransform: 'uppercase',
    }
});