package Hampus.place.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

@Controller
public class PlaceControllers {

  @Autowired
  SimpMessagingTemplate template;

  @SendTo("/topic/place")
  @Scheduled(fixedRate = 5000)
  public void broadcastPixels() {
    template.convertAndSend("/topic/place", "YOOOOOOOOO");
  }

}
