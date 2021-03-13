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

  @Scheduled(fixedRate = 5000)
  @SendTo("/topic/place")
  public void broadcastPixels()  {
    List<Long> data = redisRepo.getPixel(3,3);
    data.addAll(List.of(3L,3L));
    template.convertAndSend("/topic/place", data);
  }

  @MessageMapping("/pixel")
  public void savePixel(@Payload String pixel){
    System.out.println(pixel);
    //redisRepo.setPixel(1,2,3,4,5,6);
  }



}
