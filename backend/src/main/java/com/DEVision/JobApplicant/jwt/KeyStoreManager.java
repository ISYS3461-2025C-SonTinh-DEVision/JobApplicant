package com.DEVision.JobApplicant.jwt;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.security.Key;
import java.security.KeyStore;
import java.security.PublicKey;
import java.util.Base64;

@Component
class KeyStoreManager {

    private KeyStore keyStore;
    private String keyAlias;

    private final char[] password = "aseproject".toCharArray();

    public KeyStoreManager() {
        loadKeyStore();
    }

    private void loadKeyStore() {
        try {
            // JKS is default; PKCS12 can also be used
            keyStore = KeyStore.getInstance(KeyStore.getDefaultType());

            ClassPathResource resource = new ClassPathResource("ase_project.keystore");
            try (InputStream is = resource.getInputStream()) {
                keyStore.load(is, password);
            }

            keyAlias = keyStore.aliases().nextElement();

            System.out.println("public key " +
                    keyStore.getCertificate(keyAlias).getPublicKey());

            System.out.println("private key " +
                    keyStore.getKey(keyAlias, password));

        } catch (Exception e) {
            System.err.println("Error when loading KeyStore");
            e.printStackTrace();
            throw new IllegalStateException("Failed to load keystore from classpath", e);
        }
    }

    public PublicKey getPublicKey() {
        try {
            return keyStore.getCertificate(keyAlias).getPublicKey();
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }

    public Key getPrivateKey() {
        try {
            return keyStore.getKey(keyAlias, password);
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }

    public String getEncodedPublicKey() {
        try {
            String encodedPublicKey = Base64.getEncoder()
                    .encodeToString(keyStore
                            .getCertificate(keyAlias)
                            .getPublicKey()
                            .getEncoded());

            return encodedPublicKey;
        } catch (Exception ex) {
            System.err.println("Error in getting encoded public key");
            ex.printStackTrace();
            return null;
        }
    }
}
