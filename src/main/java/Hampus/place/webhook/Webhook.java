package Hampus.place.webhook;

import Hampus.place.Pixel;
import Hampus.place.redis.RedisRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
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


  @SubscribeMapping("/subscribe") //app/subscribe
  public String sendOneTimeMessage() {
    return "All the pixel data on subscribe";
  }

  @SneakyThrows
  @MessageMapping("/pixel")
  @SendTo("/topic/place")
  public void pixels(@Payload String pixel)  {
    System.out.println(pixel);
    Pixel p = objectMapper.readValue(pixel,Pixel.class);
    System.out.println(p);
    //redisRepo.setPixel(pixel[0],pixel[1],15,0,0,15);
    //List<Long> data = redisRepo.getPixel(pixel[0], pixel[1]);
    //data.addAll(List.of(Long.valueOf(String.valueOf(pixel[0])),Long.valueOf(String.valueOf(pixel[1]))));
    template.convertAndSend("/topic/place", objectMapper.writeValueAsString(p));

  }

}
