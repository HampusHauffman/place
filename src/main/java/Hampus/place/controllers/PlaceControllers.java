package Hampus.place.controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import redis.clients.jedis.Jedis;

@Controller
public class PlaceControllers {

  @Autowired
  SimpMessagingTemplate template;

  @SendTo("/topic/place")
  @Scheduled(fixedRate = 5000)
  public void broadcastPixels() {

    //To start redis: redis-server /usr/local/etc/redis.conf
    Jedis jedis = new Jedis("localhost");
    jedis.bitfield("mykey","SET", "u4", "0", "10");
    System.out.println(List.of(jedis.bitfield("mykey",  "GET", "u4", "0")));


    template.convertAndSend("/topic/place", List.of(1,2,3,4));
  }

}
