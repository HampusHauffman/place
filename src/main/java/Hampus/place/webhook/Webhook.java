package Hampus.place.webhook;

import Hampus.place.redis.RedisRepo;
import java.util.BitSet;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

@Controller
public class Webhook {

  @Autowired
  SimpMessagingTemplate template;

  @Autowired
  RedisRepo redisRepo;


  @SendTo("/topic/place")
  @MessageMapping("/hello")
  public void broadcastPixels(String message)  {
    System.out.println(message);
    List<Long> data = redisRepo.getPixel(3,3);
    data.addAll(List.of(3L,3L));
    template.convertAndSend("/topic/place", data);
  }

}
