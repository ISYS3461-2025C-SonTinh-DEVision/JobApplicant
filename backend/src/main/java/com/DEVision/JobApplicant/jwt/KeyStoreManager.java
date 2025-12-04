package com.DEVision.JobApplicant.jwt;

import org.springframework.stereotype.Component;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.security.*;
import java.util.Base64;

@Component
class KeyStoreManager {

    private KeyStore keyStore;

    private String keyAlias;

    private char[] password = "aseproject".toCharArray();

    // RSA Key

    public KeyStoreManager() throws KeyStoreException, IOException {
        loadKeyStore();
    }

    private void loadKeyStore() throws KeyStoreException, IOException {

        keyStore = KeyStore.getInstance(KeyStore.getDefaultType());

        FileInputStream fis = null;

        try {
            // Get the path to the keystore file in the resources folder
            File keystoreFile = ResourceUtils.getFile("classpath:ase_project.keystore");

            fis = new FileInputStream(keystoreFile);

            keyStore.load(fis, password);

            keyAlias = keyStore.aliases().nextElement();

            System.out.println("public key " +
                    keyStore.getCertificate(keyAlias).getPublicKey());

            System.out.println("private key " +
                    keyStore.getKey(keyAlias, password));

        } catch (Exception e) {
            System.err.println("Error when loading KeyStore");
            e.printStackTrace();
        } finally {
            if (fis != null) {
                fis.close();
            }
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
