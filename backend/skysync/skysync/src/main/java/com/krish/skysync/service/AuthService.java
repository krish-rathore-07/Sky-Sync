package com.krish.skysync.service;

import com.krish.skysync.dto.auth.ChangePasswordRequest;
import com.krish.skysync.dto.auth.GoogleLoginRequest;
import com.krish.skysync.dto.auth.LoginRequest;
import com.krish.skysync.dto.auth.LoginResponse;
import com.krish.skysync.dto.auth.RegisterRequest;

public interface AuthService {

    String register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    void changePassword(
            String email,
            ChangePasswordRequest request
    );

    void deleteAccount(String email);

    LoginResponse googleLogin(GoogleLoginRequest request);
}