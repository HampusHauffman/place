package Hampus.place.config;

import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Component;

@Component
public class RedisTopic extends ChannelTopic {
  public RedisTopic() {
    super("pixels");
  }
}
