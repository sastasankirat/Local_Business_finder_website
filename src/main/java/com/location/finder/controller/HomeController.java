package com.location.finder.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.location.finder.entity.User;
import com.location.finder.service.UserServices;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class HomeController {

    @Autowired
    private UserServices userServices;

    @GetMapping("/api/users")
    public List<User> getAllUsers() {
        // Fetch the list of users from the service layer
        return userServices.getAllUsers();
    }
}

