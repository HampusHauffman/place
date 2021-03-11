package Hampus.place.controllers;

import static redis.clients.jedis.Protocol.Command.BITFIELD;

import java.util.ArrayList;
import java.util.BitSet;
import java.util.List;
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

    template.convertAndSend("/topic/place", List.of(1,2,3,4));
  }

}
