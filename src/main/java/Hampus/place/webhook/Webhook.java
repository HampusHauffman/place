package Hampus.place.webhook;

import Hampus.place.redis.RedisRepo;
import java.util.BitSet;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

@Controller
public class Webhook {

  @Autowired
  SimpMessagingTemplate template;

  @Autowired
  RedisRepo redisRepo;

  @SubscribeMapping("/subscribe") //app/subscribe
  public String sendOneTimeMessage() {
    return "All the pixel data on subscribe";
  }

  @MessageMapping("/pixel")
  @SendTo("/topic/place")
  public void pixels(@Payload byte[] pixel)  {
    redisRepo.setPixel(pixel[0],pixel[1],15,0,0,15);
    List<Long> data = redisRepo.getPixel(pixel[0], pixel[1]);
    data.addAll(List.of(Long.valueOf(String.valueOf(pixel[0])),Long.valueOf(String.valueOf(pixel[1]))));
    template.convertAndSend("/topic/place", data);
  }

}
