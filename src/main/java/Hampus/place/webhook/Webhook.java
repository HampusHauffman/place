package Hampus.place.webhook;

import Hampus.place.Pixel;
import Hampus.place.redis.RedisRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.BitSet;
import java.util.List;
import lombok.SneakyThrows;
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

  ObjectMapper objectMapper = new ObjectMapper();


  @SneakyThrows
  @SubscribeMapping("/topic/place") //app/subscribe
  public String sendOneTimeMessage() {
    List<Pixel> p = new ArrayList<Pixel>();
    for(int i = 0; i < RedisRepo.IMAGE_SIZE; i++){
      for(int j = 0; j < RedisRepo.IMAGE_SIZE; j++) {
        p.add(redisRepo.getPixel(j,i));
      }
    }
    return objectMapper.writeValueAsString(p);
  }

  @SneakyThrows
  @MessageMapping("/pixel")
  @SendTo("/topic/place")
  public void pixels(@Payload String pixel)  {
    Pixel p = objectMapper.readValue(pixel,Pixel.class);
    redisRepo.setPixel(p);
    template.convertAndSend("/topic/place", objectMapper.writeValueAsString(List.of(p)));
  }

}
