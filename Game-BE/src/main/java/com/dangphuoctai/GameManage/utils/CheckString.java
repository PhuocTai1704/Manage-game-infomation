package com.dangphuoctai.GameManage.utils;

public class CheckString {

    public static boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    public static boolean isValidKeyId(String keyId) {
        if (keyId == null || keyId.isEmpty()) {
            return false;
        }
        // Regex: EN + JA (hiragana, katakana, kanji) + KO (hangul) + số
        return keyId.matches("^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uAC00-\uD7AF]+$");
    }


}
