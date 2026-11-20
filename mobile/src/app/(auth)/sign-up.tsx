
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignUp } from "@clerk/expo";
import { useRouter, type Href } from "expo-router";
import { styles } from "../../../assets/styles/auth.styles";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../constants/colors";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function SignUpScreen() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
  if (fetchStatus !== "idle") return;

  setError("");

  try {
    const { error: signUpError } = await signUp.password({
      emailAddress,
      password,
    });

    if (signUpError) {
      console.log("Sign-up error:", signUpError);
      setError(signUpError.message);
      return;
    }

    console.log("Sign-up status:", signUp.status);
    console.log("Unverified fields:", signUp.unverifiedFields);

    if (signUp.unverifiedFields.includes("email_address")) {
      const { error: verificationError } =
        await signUp.verifications.sendEmailCode();

      if (verificationError) {
        console.log("Verification email error:", verificationError);
        setError(verificationError.message);
        return;
      }

      console.log("Verification email sent successfully!");
      setPendingVerification(true);
    }
  } catch (err: any) {
    console.log("Unexpected error:", err);
    setError(err.message || "Something went wrong.");
  }
};

  // Handle email verification
  const onVerifyPress = async () => {
    if (fetchStatus !== "idle") return;

    setError("");

    try {
      await signUp.verifications.verifyEmailCode({
        code,
      });

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: () => router.replace("/" as Href),
        });
      } else {
        console.error("Sign-up requires additional steps:", signUp.status);
      }
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message ||
        "Verification failed. Please check your code and try again."
      );

      console.error(err);
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>Verify your email</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.verificationInput, error && styles.errorInput]}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#9A8478"
          keyboardType="number-pad"
          onChangeText={setCode}
        />

        <TouchableOpacity onPress={onVerifyPress} style={styles.button}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <View style={styles.container}>
        <Image
          source={require("../../../assets/images/revenue-i2.png")}
          style={styles.illustration}
        />

        <Text style={styles.title}>Create Account</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          autoCapitalize="none"
          keyboardType="email-address"
          value={emailAddress}
          placeholderTextColor="#9A8478"
          placeholder="Enter email"
          onChangeText={setEmailAddress}
        />

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#9A8478"
          secureTextEntry={true}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={onSignUpPress}
          disabled={fetchStatus === "fetching"}
        >
          <Text style={styles.buttonText}>
            {fetchStatus === "fetching" ? "Creating account..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
