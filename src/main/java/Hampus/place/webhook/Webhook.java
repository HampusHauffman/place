package Hampus.place.webhook;

import Hampus.place.Pixel;
import Hampus.place.redis.RedisRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.BitSet;
import java.util.List;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping
public class Webhook {

  @Autowired
  SimpMessagingTemplate template;

  @Autowired
  RedisRepo redisRepo;

  ObjectMapper objectMapper = new ObjectMapper();

  @Value("${spring.redis.host}")
  String redisHost;

  @GetMapping("/")
  public @ResponseBody String test(){
    return redisHost;
  }


  @SneakyThrows
  @SubscribeMapping("/topic/place") //app/subscribe
  public byte[] sendOneTimeMessage() {
    return redisRepo.getAllPixels();
  }

  @SneakyThrows
  @MessageMapping("/pixel")
  @SendTo("/topic/place")
  public void pixels(@Payload String pixel)  {
    System.out.println(pixel);
    Pixel p = objectMapper.readValue(pixel,Pixel.class);
    redisRepo.setPixel(p);
    template.convertAndSend("/topic/place", objectMapper.writeValueAsString(p));
  }

}
